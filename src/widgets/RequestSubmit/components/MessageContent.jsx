import { Box, Card, CardBody, CardHeader, Heading, Text, useColorModeValue } from '@chakra-ui/react'
import React from 'react'

export default function MessageContent({message, username, hide, ...rest}) {
  const textColorPrimary = useColorModeValue("secondaryGray.900", "white");
    const textColorSecondary = "gray.400";
  return (
    <Card {...rest} >
    <CardHeader direction='column' mb='25px' ms='10px'>
  <Heading fontSize='xl' color={textColorPrimary} fontWeight='bold'>
  {hide?"Anonymous":username}
  </Heading>
  <Text fontSize='md' color={textColorSecondary}>
  Note from sender.
  </Text>
</CardHeader>
<CardBody>
<Box overflow="auto">
<Text color={textColorPrimary} fontSize='md' fontWeight='400' ms='10px' mb='50px'>
{message}
</Text>
</Box>
</CardBody>
    </Card>
  )
}
