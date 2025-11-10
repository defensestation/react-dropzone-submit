import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useJSONBuilderContext } from "../../context/dnd-context";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { showErrorToast, showServerError } from "@/services/toast-service";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import ImageCropper from "@/components/ImageCropper";
import logo from "@/assets/images/logo.png";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Compressor from "compressorjs";
import { RgbaColorPicker } from "react-colorful"; // Import the color picker
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"; // For the popover UI
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Define the form schema with logo as a base64 string
const valuesSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    color: z.string(), // Store color as a string (e.g., "rgba(255, 0, 0, 0.5)" or "transparent")
    multistep: z.boolean(),
    showLogo: z.boolean(),
    logo: z.string().optional(), // Base64 string for the logo
}).superRefine((data, ctx) => {
    if (data.description && !data.title) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Description cannot be added if the title is not present",
            path: ["description"],
        });
    }
});

type FormValues = z.infer<typeof valuesSchema>;

const INITIAL_FORM_DATA: FormValues = {
    color: "transparent", // Default to transparent
    multistep: false,
    showLogo: true,
    title: "",
    description: "",
    logo: "", // Initialize logo as an empty string
};

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB in bytes

export default function FormProperties(): React.ReactElement | null {
    const { formProperties, updatetFormProperties } = useJSONBuilderContext();
    const [isImageCropperOpen, setIsImageCropperOpen] = useState(false);
    const [icon, setIcon] = useState<string | null>(null);
    const [croppedImage, setCroppedImage] = useState<File | Blob | null>(null);
    const [defaultImage, setDefaultImage] = useState<string | null>(null);
    const [isCropping, setCropping] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const form = useForm<FormValues>({
        resolver: zodResolver(valuesSchema),
        defaultValues: INITIAL_FORM_DATA,
        mode: "onChange",
    });

    const onSubmit = useCallback((values: FormValues) => {
        console.log({ values });
        updatetFormProperties(values);
    }, [updatetFormProperties]);

    React.useEffect(() => {
        const subscription = form.watch((formValues) => {
            if (formValues) {
                form.handleSubmit(onSubmit)();
            }
        });

        return () => subscription.unsubscribe();
    }, [form, onSubmit]);

    useEffect(() => {
        if (formProperties && !isInitialized) {
            setIsInitialized(true);
            setDefaultImage(formProperties.logo);
            form.reset({
                ...formProperties,
            });
        }
    }, [formProperties, form]);

    const fileData = useMemo(
        () =>
            croppedImage
                ? URL.createObjectURL(croppedImage)
                : defaultImage
                    ? defaultImage
                    : logo,
        [croppedImage, defaultImage]
    );

    const onCropImage = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            showErrorToast("File size must be less than 4 MB.");
            return;
        }

        setCropping(true);
        new Compressor(file, {
            height: 64,
            width: 64,
            quality: 0.4,
            success: (compressedResult) => {
                // Convert the compressed image to a base64 string
                const reader = new FileReader();
                reader.readAsDataURL(compressedResult);
                reader.onloadend = () => {
                    const base64String = reader.result as string;
                    setCroppedImage(compressedResult);
                    form.setValue("logo", base64String); // Update the form with the base64 string
                    setIsImageCropperOpen(false);
                    setCropping(false);
                };
            },
            error: (e) => {
                showServerError(e.message);
                setIsImageCropperOpen(false);
                setCropping(false);
            },
        });
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                showErrorToast("File size must be less than 4 MB.");
                return;
            }
            setIcon(URL.createObjectURL(file));
            setIsImageCropperOpen(true);
        }
    };

    // Convert RGBA object to string (e.g., { r: 255, g: 0, b: 0, a: 0.5 } => "rgba(255, 0, 0, 0.5)")
    const rgbaToString = (rgba: { r: number; g: number; b: number; a: number }) => {
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
    };

    // Convert string to RGBA object (e.g., "rgba(255, 0, 0, 0.5)" => { r: 255, g: 0, b: 0, a: 0.5 })
    const stringToRgba = (color: string) => {
        if (color === "transparent") {
            return { r: 255, g: 255, b: 255, a: 0 }; // Transparent is equivalent to rgba(255, 255, 255, 0)
        }
        const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
        if (match) {
            return {
                r: parseInt(match[1], 10),
                g: parseInt(match[2], 10),
                b: parseInt(match[3], 10),
                a: parseFloat(match[4]),
            };
        }
        return { r: 255, g: 255, b: 255, a: 1 }; // Default to white if parsing fails
    };

    // Handle reverting to transparent
    const handleRevertToTransparent = () => {
        form.setValue("color", "");
    };

    return (
        <div className="w-full">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="flex flex-col gap-3">
                        {form.watch('showLogo') && (
                            <div className="relative self-center justify-self-center rounded-lg flex justify-center items-center overflow-hidden shadow-lg w-[195px] h-[185px] border-gray-200 border">
                                <img src={fileData} className="object-cover w-[128px] h-[128px]" alt="Logo" />
                                <Button className="absolute bottom-2 left-1/2 -translate-x-1/2" type="button" size={'icon'} variant={'outline'} onClick={() => document.getElementById('logo-upload')?.click()}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleImageUpload}
                                />
                            </div>
                        )}
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Form Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter title..." {...field} />
                                    </FormControl>
                                    <FormDescription>This will be displayed on the top.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter description..." {...field} />
                                    </FormControl>
                                    <FormDescription>This will be show below the title.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Background Color</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="w-full justify-start"
                                                    style={{
                                                        backgroundColor: field.value === "transparent" ? "transparent" : field.value,
                                                        border: field.value === "transparent" ? "1px dashed #ccc" : undefined,
                                                    }}
                                                >
                                                    {field.value === "transparent" ? "Transparent" : field.value}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <div className="flex flex-col gap-3 p-3">
                                                    <RgbaColorPicker
                                                        color={stringToRgba(field.value)}
                                                        onChange={(color) => field.onChange(rgbaToString(color))}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleRevertToTransparent}
                                                    >
                                                        Reset
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>It will be the form background.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="showLogo"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Add Logo</FormLabel>
                                        <FormDescription>
                                            Logo will be added to the form.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="multistep"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel>Multi Step</FormLabel>
                                        <FormDescription>
                                            Make the form multistep.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
            <Dialog open={isImageCropperOpen} onOpenChange={setIsImageCropperOpen}>
                <DialogContent aria-description="Crop Logo Content" aria-describedby="Defense Station" className="max-w-6xl">
                    <DialogHeader>
                        <DialogTitle>Select Logo</DialogTitle>
                        <DialogDescription>Crop and press crop button to select logo.</DialogDescription>
                    </DialogHeader>
                    <div className="w-full h-full flex justify-center items-center">
                        {icon && <ImageCropper image={icon} onCrop={onCropImage} />}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}