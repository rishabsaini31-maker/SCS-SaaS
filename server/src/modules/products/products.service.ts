import { Product } from "../../types/product";

// This is a mock. Replace with DB logic.
const products: Product[] = [
  {
    id: "1",
    name: "Titanium Chronograph",
    category: "Electronics",
    stock: 142,
    price: 299.0,
    barcode: "8429103948",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO6dgf_9K-Smxq18SNgWgWekODvz7x7vxPZ-j5e6bxI7UBQBZ37JLvkbF5l8MPFCgvRrxNxWxXmvlO9RrP5xxuL1DztXYLyycXbXJEwv-WW3zkriqWD8e7FUkvk0SHd4VBWRqaL7DAXM3U0GFpVCLb-P9PS9TQnyoKUmUBtCm5DZeBv_t-3EauIdXvOl8PyXO32B93BGrBGXmPew-Y9yNxujaSFAPln8Ltibw1DMsYu74T84rzIIcn-3OR-3oxEoj-iDOW3jmSdQQ",
    status: "in-stock",
    stockRatio: 70,
  },
  // ...more products
];

export const getAllProducts = async (): Promise<Product[]> => {
  // Replace with DB fetch
  return products;
};
