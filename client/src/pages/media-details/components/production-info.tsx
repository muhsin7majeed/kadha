import { Badge, Box, Card, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuBuilding2, LuGlobe, LuLanguages } from 'react-icons/lu';
import type { MovieDetails, TvDetails } from '@/types/media';

interface ProductionInfoProps {
  data: MovieDetails | TvDetails;
}

const ProductionInfo = ({ data }: ProductionInfoProps) => {
  return (
    <VStack gap={8} align="stretch">
      {/* Production Companies */}
      {data.production_companies && data.production_companies.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            <HStack gap={2}>
              <LuBuilding2 />
              <Text>Production Companies</Text>
            </HStack>
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
            {data.production_companies.map((company) => (
              <Card.Root key={company.id} variant="outline" size="sm">
                <Card.Body>
                  <VStack gap={2} align="center" textAlign="center">
                    {company.logo_path ? (
                      <Box
                        bg="white"
                        p={2}
                        borderRadius="md"
                        width="80px"
                        height="50px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                          alt={company.name}
                          maxHeight="40px"
                          objectFit="contain"
                        />
                      </Box>
                    ) : (
                      <Box
                        width="80px"
                        height="50px"
                        bg="bg.subtle"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <LuBuilding2 size={24} />
                      </Box>
                    )}
                    <Text fontSize="sm" fontWeight="medium" lineClamp={2}>
                      {company.name}
                    </Text>
                    {company.origin_country && (
                      <Badge size="sm" variant="subtle">
                        {company.origin_country}
                      </Badge>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
        </Box>
      )}

      {/* Production Countries */}
      {data.production_countries && data.production_countries.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            <HStack gap={2}>
              <LuGlobe />
              <Text>Production Countries</Text>
            </HStack>
          </Heading>
          <HStack gap={3} flexWrap="wrap">
            {data.production_countries.map((country) => (
              <Badge key={country.iso_3166_1} size="lg" variant="outline" colorPalette="blue">
                {country.name}
              </Badge>
            ))}
          </HStack>
        </Box>
      )}

      {/* Spoken Languages */}
      {data.spoken_languages && data.spoken_languages.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            <HStack gap={2}>
              <LuLanguages />
              <Text>Spoken Languages</Text>
            </HStack>
          </Heading>
          <HStack gap={3} flexWrap="wrap">
            {data.spoken_languages.map((language) => (
              <Badge key={language.iso_639_1} size="lg" variant="subtle" colorPalette="purple">
                {language.english_name}
              </Badge>
            ))}
          </HStack>
        </Box>
      )}
    </VStack>
  );
};

export default ProductionInfo;
