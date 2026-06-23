import { useState } from 'react'
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Flex,
  Select,
  IconButton,
  Text,
  HStack,
  Icon
} from '@chakra-ui/react'
//  Correct : Importation directe depuis le sous-module md
import { MdSearch, MdArrowBackIos, MdArrowForwardIos, MdArrowUpward, MdArrowDownward } from 'react-icons/md'

export default function DataTable({ columns, data, searchPlaceholder = "Rechercher..." }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // 1. Gestion du tri (Sorting)
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  // 2. Filtrage dynamique par recherche (Multi-colonnes)
  const filteredData = data.filter((item) =>
    columns.some((col) => {
      const value = item[col.accessor]
      return value ? String(value).toLowerCase().includes(searchQuery.toLowerCase()) : false
    })
  )

  // 3. Tri des données filtrées
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0
    
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // 4. Pagination
  const totalRows = sortedData.length
  const totalPages = Math.ceil(totalRows / rowsPerPage)
  const indexOfLastRow = currentPage * rowsPerPage
  const indexOfFirstRow = indexOfLastRow - rowsPerPage
  const currentRows = sortedData.slice(indexOfFirstRow, indexOfLastRow)

  return (
    <Box bg="unipay.800" borderRadius="xl" border="1px solid" borderColor="whiteAlpha.100" p={4}>
      {/* Barre d'outils supérieure (Recherche + Lignes par page) */}
      <Flex justify="space-between" align="center" mb={4} gap={4} direction={{ base: 'column', md: 'row' }}>
        <InputGroup maxW={{ base: '100%', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <Icon as={MdSearch} color="whiteAlpha.400" />
          </InputLeftElement>
          <Input
            placeholder={searchPlaceholder}
            bg="whiteAlpha.50"
            border="1px solid"
            borderColor="whiteAlpha.100"
            _focus={{ borderColor: "unipay.400", bg: "whiteAlpha.100" }}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </InputGroup>

        <Flex align="center" gap={2}>
          <Text fontSize="xs" color="whiteAlpha.600" whiteSpace="nowrap">Lignes par page :</Text>
          <Select
            size="sm"
            bg="unipay.900"
            borderColor="whiteAlpha.200"
            w="75px"
            borderRadius="md"
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[5, 10, 25, 50].map((size) => (
              <option key={size} value={size} style={{ background: '#1A202C' }}>{size}</option>
            ))}
          </Select>
        </Flex>
      </Flex>

      {/* Tableau à défilement horizontal si nécessaire */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="whiteAlpha.50">
            <Tr borderColor="whiteAlpha.100">
              {columns.map((col) => (
                <Th
                  key={col.accessor}
                  color="whiteAlpha.500"
                  fontSize="xs"
                  cursor={col.sortable ? "pointer" : "default"}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                  textTransform="none"
                  letterSpacing="wider"
                  py={4}
                >
                  <HStack spacing={1}>
                    <Text>{col.Header}</Text>
                    {col.sortable && sortConfig.key === col.accessor && (
                      <Icon as={sortConfig.direction === 'asc' ? MdArrowUpward : MdArrowDownward} boxSize={3} color="unipay.400" />
                    )}
                  </HStack>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {currentRows.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py={8} color="whiteAlpha.400">
                  Aucun résultat trouvé
                </Td>
              </Tr>
            ) : (
              currentRows.map((row, rowIndex) => (
                <Tr key={row.id || rowIndex} _hover={{ bg: "whiteAlpha.50" }} transition="0.2s" borderColor="whiteAlpha.100">
                  {columns.map((col) => (
                    <Td key={col.accessor} py={4} color="whiteAlpha.900">
                      {col.Cell ? col.Cell({ row, value: row[col.accessor] }) : row[col.accessor]}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Barre de pagination inférieure */}
      {totalPages > 1 && (
        <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px solid" borderColor="whiteAlpha.100">
          <Text fontSize="xs" color="whiteAlpha.500">
            Affichage de {indexOfFirstRow + 1} à {Math.min(indexOfLastRow, totalRows)} sur {totalRows} entrées
          </Text>
          <HStack spacing={2}>
            <IconButton
              icon={<Icon as={MdArrowBackIos} boxSize={3} />}
              size="sm"
              variant="outline"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ bg: "whiteAlpha.100" }}
              isDisabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
            <Text fontSize="sm" color="white" px={2}>
              {currentPage} / {totalPages}
            </Text>
            <IconButton
              icon={<Icon as={MdArrowForwardIos} boxSize={3} />}
              size="sm"
              variant="outline"
              borderColor="whiteAlpha.200"
              color="white"
              _hover={{ bg: "whiteAlpha.100" }}
              isDisabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            />
          </HStack>
        </Flex>
      )}
    </Box>
  )
}