import { useCheckbox, Flex, Box, Text, useColorModeValue } from "@chakra-ui/react";
import React from "react";
export default function CustomCheckboxField(props) {
    const { getCheckboxProps } =
      useCheckbox(props)
      const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
    const onClick = () => {
        if(!props.readonly){
            props.onChange(props.value?false:true)
        }
    }
    return (
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        gridColumnGap={2}
        px={2}
        py={1}
        cursor='pointer'
        _hover={{ cursor: "pointer" }}
      >
        <Text color={textColorPrimary}
        fontSize={"md"}
        marginRight="1"
        fontWeight='bold' >{props.label}{props?.required && <span role="presentation" aria-hidden="true" class="chakra-form__required-indicator css-1ssjhh">*</span>}</Text>
        <input type={"checkbox"} value={props.value} hidden />
        <Flex
          alignItems='center'
          justifyContent='center'
          border='2px solid'
          borderColor='green.500'
          w={4}
          h={4}
          {...getCheckboxProps()}
          onClick={onClick}
        >
          {props.value && <Box w={2} h={2} bg='brand.500' />}
        </Flex>
      </Box>
    )
  }