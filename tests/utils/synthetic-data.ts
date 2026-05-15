import { faker } from '@faker-js/faker';

/**
 * Generates synthetic, GDPR-compliant test data for the enrollment journey.
 * This ensures no real PII is used during testing.
 */
export const generateSyntheticUser = () => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const email = `test.${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.ph`;

  return {
    firstName,
    lastName,
    middleName: faker.person.middleName(),
    email,
    phone: faker.phone.number({ style: 'international' }),
    birthDate: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0],
    address: {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      province: faker.location.state(),
      zipCode: faker.location.zipCode(),
    },
    education: faker.helpers.arrayElement(['High School', 'College Graduate', 'Vocational', 'Post-Graduate']),
    employmentStatus: faker.helpers.arrayElement(['Employed', 'Unemployed', 'Self-Employed', 'Student']),
    uli: `ULI-${faker.string.alphanumeric(10).toUpperCase()}`, // Synthetic ULI for TESDA
  };
};

/**
 * Generates an invalid document for negative testing.
 */
export const generateInvalidDocument = () => {
  return {
    name: 'malicious_payload.exe',
    content: Buffer.from('MZ' + 'A'.repeat(1024)), // Fake executable header
    mimeType: 'application/x-msdownload',
  };
};

/**
 * Generates a oversized document for negative testing.
 */
export const generateOversizedDocument = (sizeInMb: number = 15) => {
  return {
    name: 'oversized_image.jpg',
    content: Buffer.alloc(sizeInMb * 1024 * 1024),
    mimeType: 'image/jpeg',
  };
};
