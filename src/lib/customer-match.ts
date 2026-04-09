interface CustomerLike {
  id: number;
  name: string;
  phone: string;
}

export type CustomerMatchKind = "exact-name-phone" | "exact-name" | "phone-match" | "similar-name";

export interface CustomerMatch<TCustomer extends CustomerLike = CustomerLike> {
  customer: TCustomer;
  kind: CustomerMatchKind;
  distance: number;
  score: number;
}

function collapseWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCustomerName(value: string) {
  return collapseWhitespace(value).toLocaleLowerCase().normalize("NFKC");
}

export function compactCustomerName(value: string) {
  return normalizeCustomerName(value).replace(/[\s\-_.()/\\]+/g, "");
}

export function normalizeCustomerPhone(value: string) {
  return value.replace(/\D+/g, "");
}

function levenshteinDistance(left: string, right: string) {
  if (!left) return right.length;
  if (!right) return left.length;

  const rows = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    let previous = rows[0];
    rows[0] = leftIndex;

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const current = rows[rightIndex];
      const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;

      rows[rightIndex] = Math.min(
        rows[rightIndex] + 1,
        rows[rightIndex - 1] + 1,
        previous + cost
      );

      previous = current;
    }
  }

  return rows[right.length];
}

function getSimilarityDistanceLimit(nameLength: number) {
  if (nameLength <= 4) return 0;
  if (nameLength <= 8) return 1;
  return 2;
}

export function findPotentialCustomerMatches<TCustomer extends CustomerLike>(
  customers: TCustomer[],
  input: {
    name: string;
    phone?: string | null;
  },
  options?: {
    excludeCustomerId?: number;
    limit?: number;
  }
) {
  const normalizedName = normalizeCustomerName(input.name);
  const compactName = compactCustomerName(input.name);
  const normalizedPhone = normalizeCustomerPhone(input.phone ?? "");

  if (!normalizedName) {
    return [] as CustomerMatch<TCustomer>[];
  }

  const similarityLimit = getSimilarityDistanceLimit(compactName.length);

  return customers
    .filter((customer) => customer.id !== options?.excludeCustomerId)
    .map((customer) => {
      const customerCompactName = compactCustomerName(customer.name);
      const customerPhone = normalizeCustomerPhone(customer.phone);
      const distance = levenshteinDistance(compactName, customerCompactName);
      const hasExactName = compactName === customerCompactName;
      const hasExactPhone = Boolean(normalizedPhone) && normalizedPhone === customerPhone;
      const hasContainedName =
        compactName.length >= 4 &&
        (customerCompactName.includes(compactName) || compactName.includes(customerCompactName));
      const hasSimilarName = hasContainedName || distance <= similarityLimit;

      if (hasExactName && hasExactPhone) {
        return {
          customer,
          kind: "exact-name-phone" as const,
          distance,
          score: 400,
        };
      }

      if (hasExactName) {
        return {
          customer,
          kind: "exact-name" as const,
          distance,
          score: 300,
        };
      }

      if (hasExactPhone) {
        return {
          customer,
          kind: "phone-match" as const,
          distance,
          score: 200,
        };
      }

      if (hasSimilarName) {
        return {
          customer,
          kind: "similar-name" as const,
          distance,
          score: 100 - distance,
        };
      }

      return null;
    })
    .filter((match): match is CustomerMatch<TCustomer> => match !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.distance !== right.distance) {
        return left.distance - right.distance;
      }

      return left.customer.name.localeCompare(right.customer.name);
    })
    .slice(0, options?.limit ?? 3);
}

export function findExactCustomerIdentityMatch<TCustomer extends CustomerLike>(
  customers: TCustomer[],
  input: {
    name: string;
    phone: string;
  },
  options?: {
    excludeCustomerId?: number;
  }
) {
  return (
    findPotentialCustomerMatches(customers, input, {
      excludeCustomerId: options?.excludeCustomerId,
      limit: 1,
    }).find((match) => match.kind === "exact-name-phone") ?? null
  );
}
