import bcrypt from "bcrypt";
import dotenv from "dotenv";
import mongoose, { Types } from "mongoose";
import { pathToFileURL } from "node:url";

import {
  CustomerModel,
  FunnelEventModel,
  OrderModel,
  ProductModel,
  SessionModel
} from "../src/analytics";
import type { Device, OrderStatus, TrafficSource } from "../src/analytics/analytics.enums";
import { UserModel } from "../src/auth/user.model";

dotenv.config();

interface SeedStats {
  users: number;
  products: number;
  customers: number;
  orders: number;
  sessions: number;
  funnelEvents: number;
}

interface ProductSeed {
  name: string;
  category: string;
  price: number;
  stock: number;
  soldUnits: number;
}

interface CustomerSeed {
  name: string;
  email: string;
  createdAt: Date;
}

interface CreatedProduct extends ProductSeed {
  _id: Types.ObjectId;
}

interface CreatedCustomer extends CustomerSeed {
  _id: Types.ObjectId;
}

const productCount = 100;
const customerCount = 60;
const orderCount = 300;
const analyticsDays = 180;

const demoUser = {
  email: "demo@demo.com",
  password: "demo1234",
  storeName: "Demo Store"
};

const baseProducts: ProductSeed[] = [
  { name: "Classic Cotton T-Shirt", category: "Apparel", price: 24.99, stock: 84, soldUnits: 182 },
  { name: "Organic Denim Jacket", category: "Apparel", price: 89.99, stock: 31, soldUnits: 76 },
  { name: "Running Performance Shoes", category: "Footwear", price: 119.99, stock: 42, soldUnits: 94 },
  { name: "Leather Everyday Sneakers", category: "Footwear", price: 99.99, stock: 27, soldUnits: 68 },
  { name: "Minimalist Desk Lamp", category: "Home Office", price: 54.99, stock: 53, soldUnits: 88 },
  { name: "Ergonomic Laptop Stand", category: "Home Office", price: 44.99, stock: 67, soldUnits: 132 },
  { name: "Stainless Steel Water Bottle", category: "Accessories", price: 19.99, stock: 121, soldUnits: 241 },
  { name: "Canvas Weekend Tote", category: "Accessories", price: 34.99, stock: 58, soldUnits: 117 },
  { name: "Wireless Noise-Canceling Earbuds", category: "Electronics", price: 149.99, stock: 36, soldUnits: 83 },
  { name: "Portable Bluetooth Speaker", category: "Electronics", price: 79.99, stock: 44, soldUnits: 97 },
  { name: "Ceramic Dinner Plate Set", category: "Kitchen", price: 64.99, stock: 24, soldUnits: 55 },
  { name: "Cold Brew Coffee Maker", category: "Kitchen", price: 39.99, stock: 39, soldUnits: 78 },
  { name: "Daily Hydration Serum", category: "Beauty", price: 29.99, stock: 73, soldUnits: 156 },
  { name: "Mineral Sunscreen SPF 50", category: "Beauty", price: 22.99, stock: 91, soldUnits: 201 },
  { name: "Adjustable Resistance Bands", category: "Fitness", price: 27.99, stock: 66, soldUnits: 143 },
  { name: "Cork Yoga Mat", category: "Fitness", price: 69.99, stock: 29, soldUnits: 62 },
  { name: "Linen Throw Pillow", category: "Home Decor", price: 32.99, stock: 47, soldUnits: 81 },
  { name: "Woven Storage Basket", category: "Home Decor", price: 42.99, stock: 35, soldUnits: 69 },
  { name: "Smart LED Light Strip", category: "Electronics", price: 34.99, stock: 79, soldUnits: 174 },
  { name: "Travel Packing Cubes", category: "Accessories", price: 26.99, stock: 88, soldUnits: 163 }
];

const additionalProductNames = [
  ["Merino Wool Crewneck", "Apparel"],
  ["Relaxed Fit Chinos", "Apparel"],
  ["Trail Running Socks", "Footwear"],
  ["Waterproof Hiking Boots", "Footwear"],
  ["Walnut Monitor Riser", "Home Office"],
  ["Cable Management Kit", "Home Office"],
  ["RFID Travel Wallet", "Accessories"],
  ["Recycled Canvas Backpack", "Accessories"],
  ["USB-C Charging Hub", "Electronics"],
  ["Compact Action Camera", "Electronics"],
  ["Cast Iron Skillet", "Kitchen"],
  ["Bamboo Cutting Board", "Kitchen"],
  ["Vitamin C Brightening Cream", "Beauty"],
  ["Hydrating Lip Balm Trio", "Beauty"],
  ["Foam Recovery Roller", "Fitness"],
  ["Weighted Jump Rope", "Fitness"],
  ["Scented Soy Candle", "Home Decor"],
  ["Framed Botanical Print", "Home Decor"],
  ["Insulated Lunch Box", "Kitchen"],
  ["Quick Dry Gym Towel", "Fitness"],
  ["Oversized Hoodie", "Apparel"],
  ["Slip-On Knit Loafers", "Footwear"],
  ["Adjustable Desk Organizer", "Home Office"],
  ["Crossbody Phone Sling", "Accessories"],
  ["Smart Home Plug Pair", "Electronics"],
  ["Glass Food Storage Set", "Kitchen"],
  ["Gentle Exfoliating Toner", "Beauty"],
  ["Balance Board Trainer", "Fitness"],
  ["Cotton Knit Blanket", "Home Decor"],
  ["Mini Travel Steamer", "Accessories"]
] satisfies Array<[string, string]>;

const products: ProductSeed[] = [
  ...baseProducts,
  ...additionalProductNames.map(([name, category], index) => ({
    name,
    category,
    price: roundCurrency(18.99 + ((index * 11) % 120) + (index % 4) * 0.5),
    stock: 22 + ((index * 9) % 96),
    soldUnits: 34 + ((index * 17) % 210)
  })),
  ...Array.from({ length: productCount - baseProducts.length - additionalProductNames.length }, (_, index) => {
    const categories = ["Apparel", "Footwear", "Home Office", "Accessories", "Electronics", "Kitchen", "Beauty", "Fitness", "Home Decor"];
    const category = categories[index % categories.length];

    return {
      name: `${category} Demo SKU ${String(index + 1).padStart(2, "0")}`,
      category,
      price: roundCurrency(14.99 + ((index * 13) % 160) + (index % 3) * 0.75),
      stock: 4 + ((index * 11) % 140),
      soldUnits: 20 + ((index * 19) % 320)
    };
  })
];

const baseCustomers: CustomerSeed[] = [
  customer("Ava Johnson", "ava.johnson@example.com", 86),
  customer("Noah Smith", "noah.smith@example.com", 79),
  customer("Mia Williams", "mia.williams@example.com", 74),
  customer("Liam Brown", "liam.brown@example.com", 68),
  customer("Sophia Davis", "sophia.davis@example.com", 61),
  customer("Ethan Miller", "ethan.miller@example.com", 55),
  customer("Isabella Wilson", "isabella.wilson@example.com", 49),
  customer("Lucas Moore", "lucas.moore@example.com", 43),
  customer("Amelia Taylor", "amelia.taylor@example.com", 37),
  customer("Mason Anderson", "mason.anderson@example.com", 32),
  customer("Harper Thomas", "harper.thomas@example.com", 28),
  customer("Logan Jackson", "logan.jackson@example.com", 24),
  customer("Evelyn White", "evelyn.white@example.com", 20),
  customer("James Harris", "james.harris@example.com", 17),
  customer("Ella Martin", "ella.martin@example.com", 14),
  customer("Benjamin Thompson", "benjamin.thompson@example.com", 11),
  customer("Grace Garcia", "grace.garcia@example.com", 8),
  customer("Henry Martinez", "henry.martinez@example.com", 5),
  customer("Chloe Robinson", "chloe.robinson@example.com", 3),
  customer("Daniel Clark", "daniel.clark@example.com", 1)
];

const customers: CustomerSeed[] = [
  ...baseCustomers,
  ...Array.from({ length: customerCount - baseCustomers.length }, (_, index) =>
    customer(
      `Demo Customer ${String(index + 1).padStart(2, "0")}`,
      `demo.customer.${String(index + 1).padStart(2, "0")}@example.com`,
      1 + ((index * 4) % (analyticsDays - 1))
    )
  )
];

const orderStatuses: OrderStatus[] = [
  ...repeat<OrderStatus>("delivered", 30),
  ...repeat<OrderStatus>("processing", 8),
  ...repeat<OrderStatus>("shipped", 5),
  ...repeat<OrderStatus>("pending", 5),
  ...repeat<OrderStatus>("cancelled", 2)
];

const trafficSources: TrafficSource[] = [
  ...repeat<TrafficSource>("organic", 20),
  ...repeat<TrafficSource>("paid", 13),
  ...repeat<TrafficSource>("direct", 7),
  ...repeat<TrafficSource>("social", 6),
  ...repeat<TrafficSource>("email", 4)
];

const sessionSourcePattern: TrafficSource[] = [
  "organic",
  "organic",
  "organic",
  "organic",
  "paid",
  "paid",
  "paid",
  "direct",
  "social",
  "email"
];

const devicePattern: Device[] = ["desktop", "mobile", "mobile", "desktop", "tablet"];

function repeat<T>(value: T, count: number) {
  return Array.from({ length: count }, () => value);
}

function daysAgo(days: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function customer(name: string, email: string, registeredDaysAgo: number): CustomerSeed {
  return {
    name,
    email,
    createdAt: daysAgo(registeredDaysAgo)
  };
}

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

function orderDate(index: number) {
  const spreadDays = analyticsDays - 1 - Math.floor((index * analyticsDays) / orderCount);
  const date = daysAgo(spreadDays);
  date.setHours(9 + (index % 10), (index * 7) % 60, 0, 0);
  return date;
}

function customerIndexForOrder(index: number) {
  return (index * 7 + Math.floor(index / 5)) % customers.length;
}

function productIndexesForOrder(index: number) {
  const primary = (index * 3) % products.length;
  const secondary = (primary + 5 + (index % 4)) % products.length;
  const tertiary = (primary + 11) % products.length;

  if (index % 5 === 0) {
    return [primary, secondary, tertiary];
  }

  if (index % 2 === 0) {
    return [primary, secondary];
  }

  return [primary];
}

async function resetDatabase() {
  if (!mongoose.connection.db) {
    throw new Error("MongoDB connection is not ready");
  }

  await mongoose.connection.db.dropDatabase();
  await Promise.all([
    UserModel.createCollection(),
    ProductModel.createCollection(),
    CustomerModel.createCollection(),
    OrderModel.createCollection(),
    SessionModel.createCollection(),
    FunnelEventModel.createCollection()
  ]);
}

async function syncIndexes() {
  await Promise.all([
    UserModel.syncIndexes(),
    ProductModel.syncIndexes(),
    CustomerModel.syncIndexes(),
    OrderModel.syncIndexes(),
    SessionModel.syncIndexes(),
    FunnelEventModel.syncIndexes()
  ]);
}

async function createDemoUser() {
  const passwordHash = await bcrypt.hash(demoUser.password, 12);

  return UserModel.create({
    email: demoUser.email,
    passwordHash,
    storeName: demoUser.storeName
  });
}

async function createProducts(userId: Types.ObjectId): Promise<CreatedProduct[]> {
  return ProductModel.insertMany(
    products.map((product) => ({
      userId,
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      soldUnits: product.soldUnits,
      createdAt: daysAgo(analyticsDays - 1)
    }))
  );
}

async function createCustomers(userId: Types.ObjectId): Promise<CreatedCustomer[]> {
  return CustomerModel.insertMany(
    customers.map((customerSeed) => ({
      userId,
      name: customerSeed.name,
      email: customerSeed.email,
      totalOrders: 0,
      lifetimeValue: 0,
      createdAt: customerSeed.createdAt
    }))
  );
}

async function createOrders(
  userId: Types.ObjectId,
  createdProducts: CreatedProduct[],
  createdCustomers: CreatedCustomer[]
) {
  const customerStats = new Map<string, { totalOrders: number; lifetimeValue: number }>();

  const orderDocuments = Array.from({ length: orderCount }, (_, index) => {
    const customerForOrder = createdCustomers[customerIndexForOrder(index)];
    const items = productIndexesForOrder(index).map((productIndex, itemIndex) => {
      const product = createdProducts[productIndex];
      const qty = itemIndex === 0 && index % 6 === 0 ? 2 : 1;

      return {
        productId: product._id,
        qty,
        price: product.price
      };
    });
    const total = roundCurrency(items.reduce((sum, item) => sum + item.qty * item.price, 0));
    const status = orderStatuses[index % orderStatuses.length];

    if (status !== "cancelled") {
      const key = customerForOrder._id.toString();
      const stats = customerStats.get(key) ?? { totalOrders: 0, lifetimeValue: 0 };
      stats.totalOrders += 1;
      stats.lifetimeValue = roundCurrency(stats.lifetimeValue + total);
      customerStats.set(key, stats);
    }

    return {
      userId,
      customerId: customerForOrder._id,
      status,
      total,
      items,
      source: trafficSources[index % trafficSources.length],
      createdAt: orderDate(index)
    };
  });

  const createdOrders = await OrderModel.insertMany(orderDocuments);

  await Promise.all(
    createdCustomers.map((createdCustomer) => {
      const stats = customerStats.get(createdCustomer._id.toString()) ?? {
        totalOrders: 0,
        lifetimeValue: 0
      };

      return CustomerModel.updateOne(
        { _id: createdCustomer._id },
        {
          $set: {
            totalOrders: stats.totalOrders,
            lifetimeValue: stats.lifetimeValue
          }
        }
      );
    })
  );

  return createdOrders;
}

async function createSessions(userId: Types.ObjectId) {
  const documents = Array.from({ length: analyticsDays }, (_, index) => {
    const day = analyticsDays - 1 - index;
    const weekdayBoost = index % 7 === 1 || index % 7 === 2 ? 85 : 0;
    const campaignBoost = index >= 62 ? 120 : index >= 35 ? 60 : 0;
    const visits = 520 + index * 5 + weekdayBoost + campaignBoost + (index % 5) * 18;

    return {
      userId,
      date: daysAgo(day),
      visits,
      source: sessionSourcePattern[index % sessionSourcePattern.length],
      device: devicePattern[index % devicePattern.length],
      bounced: index % 9 === 0 || index % 11 === 0
    };
  });

  return SessionModel.insertMany(documents);
}

async function createFunnelEvents(userId: Types.ObjectId) {
  const documents = Array.from({ length: analyticsDays }, (_, index) => {
    const day = analyticsDays - 1 - index;
    const visits = 650 + index * 7 + (index % 6) * 23 + (index >= 60 ? 130 : 0);
    const productViews = Math.round(visits * (0.44 + (index % 4) * 0.015));
    const addToCart = Math.round(productViews * (0.34 + (index % 3) * 0.018));
    const checkout = Math.round(addToCart * (0.48 + (index % 2) * 0.025));
    const orders = Math.round(checkout * (0.48 + (index % 5) * 0.012));
    const date = daysAgo(day);

    return [
      { userId, step: "visit", count: visits, date },
      { userId, step: "product_view", count: productViews, date },
      { userId, step: "add_to_cart", count: addToCart, date },
      { userId, step: "checkout", count: checkout, date },
      { userId, step: "order", count: orders, date }
    ];
  }).flat();

  return FunnelEventModel.insertMany(documents);
}

export async function seedDatabase(mongoUri = process.env.MONGO_URI): Promise<SeedStats> {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required to seed the database");
  }

  await mongoose.connect(mongoUri);
  await resetDatabase();

  const user = await createDemoUser();
  const userId = user._id;
  const createdProducts = await createProducts(userId);
  const createdCustomers = await createCustomers(userId);
  await createOrders(userId, createdProducts, createdCustomers);
  await createSessions(userId);
  await createFunnelEvents(userId);
  await syncIndexes();

  return {
    users: await UserModel.countDocuments(),
    products: await ProductModel.countDocuments(),
    customers: await CustomerModel.countDocuments(),
    orders: await OrderModel.countDocuments(),
    sessions: await SessionModel.countDocuments(),
    funnelEvents: await FunnelEventModel.countDocuments()
  };
}

async function runCli() {
  const stats = await seedDatabase();
  console.log("Seed completed");
  console.table(stats);
  await mongoose.disconnect();
}

const isCli = process.argv[1] ? import.meta.url === pathToFileURL(process.argv[1]).href : false;

if (isCli) {
  runCli().catch(async (error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    await mongoose.disconnect();
    process.exit(1);
  });
}
