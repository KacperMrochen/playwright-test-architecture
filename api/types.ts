/** Shapes returned by automationexercise.com's documented API.
 *
 * Every endpoint answers HTTP 200 and puts the real outcome in
 * `responseCode`, errors included. The body is JSON served as `text/html`, which `response.json()` parses
 * regardless. */

export type ApiResult = {
  responseCode: number;
  message?: string;
};

export type Product = {
  id: number;
  name: string;
  price: string;
  brand: string;
  category: {
    usertype: { usertype: string };
    category: string;
  };
};

export type ProductsResult = ApiResult & { products: Product[] };

export type Brand = { id: number; brand: string };

export type BrandsResult = ApiResult & { brands: Brand[] };

export type UserDetails = {
  id: number;
  name: string;
  email: string;
  title: string;
  birth_day: string;
  birth_month: string;
  birth_year: string;
  first_name: string;
  last_name: string;
  company: string;
  address1: string;
  address2: string;
  country: string;
  state: string;
  city: string;
  zipcode: string;
};

export type UserDetailsResult = ApiResult & { user: UserDetails };
