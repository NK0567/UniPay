import { Box, Stat, StatLabel, StatNumber, StatHelpText, Flex, Icon } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion(Box)

export default function StatCard({ title, value, icon, helpText, color = 'unipay.400', delay = 0 }) {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay, ease: 'easeOut' }}
    >
      <Box p={5} bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" shadow="xl">
        <Flex justify="space-between" align="center">
          <Stat>
            <StatLabel color="whiteAlpha.600" fontSize="sm" fontWeight="medium" textTransform="uppercase">
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold" mt={2} color="white">
              {value}
            </StatNumber>
            {helpText && (
              <StatHelpText mb={0} mt={2} color="whiteAlpha.500" fontSize="xs">
                {helpText}
              </StatHelpText>
            )}
          </Stat>
          <Flex bg="whiteAlpha.50" p={3} borderRadius="lg" align="center" justify="center">
            <Icon as={icon} w={6} h={6} color={color} />
          </Flex>
        </Flex>
      </Box>
    </MotionBox>
  )
}