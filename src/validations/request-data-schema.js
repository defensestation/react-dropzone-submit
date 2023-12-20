import * as yup from "yup";

export const createRequestedDataSchema = yup.object().shape({
  label: yup.string().required().max(20),
  message: yup.string().required().max(250),
  req_emails: yup.array().required().min(1, "Atleast 1 email is required."),
  requested_files: yup.array().of(
    yup.object().shape({
      file_name: yup
        .string()
        .min(4, "Name is too short")
        .required("Name is Required"),
      file_required: yup.boolean().required(),
    })
  ),
  requested_fields: yup
    .array()
    .of(
      yup.object().shape({
        field_name: yup
          .string()
          .min(4, "Name is too short")
          .required("Name is Required"),
        field_required: yup.boolean().required(),
      })
    )
    .min(1, "Template should have atleast one field."),
    access_limit: yup.number().min(1).max(10).required(),
});

export const updateRequestedDataSchema = yup.object().shape({
  label: yup.string().required().max(20),
  retry_limit: yup.number().min(1).max(10).required(),
});
