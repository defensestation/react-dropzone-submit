import { ChakraProvider } from '@chakra-ui/react';
import React from 'react';
import chakraTheme from "../theme/theme";
import PropTypes from "prop-types";

export default function ThemeProvider({ children, theme }) {
  return (
    <ChakraProvider theme={theme?theme:chakraTheme}>
        {children}
    </ChakraProvider>
  )
}


ThemeProvider.propTypes = {
    theme: PropTypes.object,
}