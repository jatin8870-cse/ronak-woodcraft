
"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  X,
  Plus,
} from "lucide-react";

import {
  useStore,
  type ProductInput,
} from "@/context/StoreContext";

import {
  CATEGORIES,
  inr,
  type Product,
} from "@/lib/data";

import { api } from "@/lib/client";

import ImagePicker from "./ImagePicker";
import ProductArt from "../ProductArt";

const PAGE_SIZE = 24;

type ProductPageResponse = {
  items: Product[];
  nextCursor: string | null;
  hasMore: boolean;
};

const blank = {
  name: "",
  category: "Beds",
  price: "",
  mrp: "",
  stock: "10",
  tag: "",
  rating: "4.5",
  desc: "",
  images: [] as string[],
};

export default function ProductManager() {
  const { saveProduct, deleteProduct } = useStore();

  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState<Product | null>(null);

  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [failedImages, setFailedImages] = useState<string[]>([]);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("pop");

  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [hasMore, setHasMore] = useState(false);
  const [history, setHistory] = useState<(string | null)[]>([]);

  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const requestId = useRef(0);

  // Form input handler
  const set = (key: string, value: string | string[]) => {
    setF((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  // Categories
  const cats = Array.from(
    new Set([
      ...CATEGORIES,
      ...products.map((product) => product.category),
    ])
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setHistory([]);
      setCurrentCursor(null);
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch products
  const loadProducts = useCallback(async () => {
    const id = ++requestId.current;

    setProductsLoading(true);

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        sort,
        q: search,
        cat: category,
      });

      if (currentCursor) {
        params.set("cursor", currentCursor);
      }

      const data = await api<ProductPageResponse>(
        `/api/products/page?${params.toString()}`
      );

      if (id !== requestId.current) return;

      setProducts(data.items);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      if (id !== requestId.current) return;

      console.error("Products loading error:", error);

      setMsg(
        error instanceof Error
          ? error.message
          : "Products could not be loaded."
      );
    } finally {
      if (id === requestId.current) {
        setProductsLoading(false);
      }
    }
  }, [currentCursor, search, category, sort]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts, refreshKey]);

  // Reset pagination
  const resetPagination = () => {
    setHistory([]);
    setCurrentCursor(null);
    setPage(1);
  };

  // Refresh products
  const refreshProducts = () => {
    resetPagination();
    setRefreshKey((previous) => previous + 1);
  };

  // Next page
  const nextPage = () => {
    if (!nextCursor || !hasMore || productsLoading) return;

    setHistory((previous) => [
      ...previous,
      currentCursor,
    ]);

    setCurrentCursor(nextCursor);
    setPage((previous) => previous + 1);
  };

  // Previous page
  const previousPage = () => {
    if (!history.length || productsLoading) return;

    const previous = [...history];
    const cursor = previous.pop() ?? null;

    setHistory(previous);
    setCurrentCursor(cursor);

    setPage((previousPage) =>
      Math.max(1, previousPage - 1)
    );
  };

  // Submit product
  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!f.name.trim()) {
      setMsg("Please enter product name.");
      return;
    }

    if (!f.price || Number(f.price) < 0) {
      setMsg("Please enter a valid price.");
      return;
    }

    setBusy(true);
    setMsg("");

    try {
      const productData: ProductInput = {
        name: f.name.trim(),
        category: f.category,
        price: Number(f.price),
        mrp: Math.max(
          Number(f.mrp) || Number(f.price),
          Number(f.price)
        ),
        stock: Number(f.stock) || 0,
        tag: f.tag.trim() || undefined,
        rating: Number(f.rating) || 4.5,
        hue: editing?.hue ?? 24,
        desc: f.desc.trim(),
        images: f.images,
      };

      await saveProduct(
        productData,
        editing ? editing.id : undefined
      );

      const wasEditing = Boolean(editing);

      setF(blank);
      setEditing(null);

      setMsg(
        wasEditing
          ? "Product updated successfully."
          : "Product added successfully."
      );

      refreshProducts();
    } catch (error) {
      console.error("Save product error:", error);

      setMsg(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  };

  // Edit product
  const editProduct = (product: Product) => {
    setEditing(product);

    setF({
      name: product.name,
      category: product.category,
      price: String(product.price),
      mrp: String(product.mrp),
      stock: String(product.stock ?? 0),
      tag: product.tag ?? "",
      rating: String(product.rating),
      desc: product.desc ?? "",
      images: product.images ?? [],
    });

    setMsg("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditing(null);
    setF(blank);
    setMsg("");
  };

  // Delete product
  const removeProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    setMsg("");

    try {
      await deleteProduct(product.id);

      setMsg("Product deleted successfully.");

      refreshProducts();
    } catch (error) {
      console.error("Delete product error:", error);

      setMsg(
        error instanceof Error
          ? error.message
          : "Product could not be deleted."
      );
    }
  };

  return (
    <div className="pm-page">

      {/* Product Form */}
      <section className="pm-panel">

        <div className="pm-heading">
          <div>
            <span className="pm-eyebrow">
              PRODUCT MANAGEMENT
            </span>

            <h2>
              {editing ? "Edit Product" : "Add New Product"}
            </h2>

            <p>
              {editing
                ? "Update your product details below."
                : "Add a new item to your store catalogue."}
            </p>
          </div>

          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="pm-btn pm-btn-light"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>

        <form onSubmit={submit} className="pm-form">

          <div className="pm-form-grid">

            <label className="pm-field">
              <span>Product Name</span>

              <input
                required
                value={f.name}
                onChange={(e) =>
                  set("name", e.target.value)
                }
                placeholder="Enter product name"
              />
            </label>

            <label className="pm-field">
              <span>Category</span>

              <select
                value={f.category}
                onChange={(e) =>
                  set("category", e.target.value)
                }
              >
                {cats.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>

            <label className="pm-field">
              <span>Selling Price (₹)</span>

              <input
                required
                type="number"
                min="0"
                value={f.price}
                onChange={(e) =>
                  set("price", e.target.value)
                }
                placeholder="Selling price"
              />
            </label>

            <label className="pm-field">
              <span>MRP (₹)</span>

              <input
                type="number"
                min="0"
                value={f.mrp}
                onChange={(e) =>
                  set("mrp", e.target.value)
                }
                placeholder="Original price"
              />
            </label>

            <label className="pm-field">
              <span>Stock Quantity</span>

              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={(e) =>
                  set("stock", e.target.value)
                }
              />
            </label>

            <label className="pm-field">
              <span>Rating</span>

              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={f.rating}
                onChange={(e) =>
                  set("rating", e.target.value)
                }
              />
            </label>

            <label className="pm-field pm-full">
              <span>Product Tag</span>

              <input
                value={f.tag}
                onChange={(e) =>
                  set("tag", e.target.value)
                }
                placeholder="e.g. Bestseller, New Arrival"
              />
            </label>

            <label className="pm-field pm-full">
              <span>Description</span>

              <textarea
                rows={4}
                value={f.desc}
                onChange={(e) =>
                  set("desc", e.target.value)
                }
                placeholder="Enter product description..."
              />
            </label>

          </div>

          {/* Image Picker */}
          <div className="pm-image-field">
            <span className="pm-label">
              Product Images
            </span>

            <ImagePicker
              images={f.images}
              onChange={(images) =>
                set("images", images)
              }
            />
          </div>

          {msg && (
            <div className="pm-message">
              {msg}
            </div>
          )}

          <div className="pm-form-actions">
            <button
              type="submit"
              disabled={busy}
              className="pm-btn pm-btn-primary"
            >
              {busy ? (
                "Please wait..."
              ) : editing ? (
                <>
                  <Pencil size={17} />
                  Update Product
                </>
              ) : (
                <>
                  <Plus size={18} />
                  Add Product
                </>
              )}
            </button>
          </div>

        </form>
      </section>

      {/* Products Section */}
      <section className="pm-products">

        <div className="pm-list-heading">
          <div>
            <span className="pm-eyebrow">
              YOUR CATALOGUE
            </span>

            <h2>Admin Products</h2>

            <p>
              Manage your store products and inventory.
            </p>
          </div>

          <span className="pm-page-count">
            Page {page}
          </span>
        </div>

        {/* Filters */}
        <div className="pm-filters">

          <div className="pm-search">
            <Search size={18} />

            <input
              value={searchInput}
              onChange={(e) =>
                setSearchInput(e.target.value)
              }
              placeholder="Search products..."
            />

            {searchInput && (
              <button
                type="button"
                onClick={() =>
                  setSearchInput("")
                }
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              resetPagination();
            }}
          >
            <option value="All">
              All Categories
            </option>

            {cats.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              resetPagination();
            }}
          >
            <option value="pop">
              Top Rated
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>
          </select>

        </div>

        {/* Loading */}
        {productsLoading && (
          <div className="pm-loading">
            <span className="pm-spinner" />
            <p>Loading products...</p>
          </div>
        )}

        {/* Error */}
        {!productsLoading && msg && products.length === 0 && (
          <div className="pm-empty">
            <Package size={38} />

            <p>{msg}</p>

            <button
              type="button"
              onClick={refreshProducts}
              className="pm-btn pm-btn-primary"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!productsLoading &&
          products.length === 0 &&
          !msg && (
            <div className="pm-empty">
              <Package size={42} />

              <h3>No products found</h3>

              <p>
                Try changing your search or category filter.
              </p>
            </div>
          )}

        {/* Product Grid */}
        {!productsLoading && products.length > 0 && (
          <div className="pm-grid">

            {products.map((product) => (
              <article
                key={product.id}
                className="pm-card"
              >

                <div className="pm-card-top">

                  {/* Product Image with Fallback */}
                  <div className="pm-product-image">

                    {product.images?.[0] &&
                    !failedImages.includes(product.id) ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        onError={() => {
                          setFailedImages((previous) =>
                            previous.includes(product.id)
                              ? previous
                              : [...previous, product.id]
                          );
                        }}
                      />
                    ) : (
                      <ProductArt
                        p={product}
                        size={24}
                      />
                    )}

                  </div>

                  <div className="pm-product-info">

                    <h3 title={product.name}>
                      {product.name}
                    </h3>

                    <span className="pm-category">
                      {product.category}
                    </span>

                    <strong className="pm-price">
                      {inr(product.price)}
                    </strong>

                    <span className="pm-stock">
                      Stock: {product.stock ?? 0} · Rating: {product.rating}
                    </span>

                  </div>

                </div>

                {/* Actions */}
                <div className="pm-card-actions">

                  <button
                    type="button"
                    onClick={() => editProduct(product)}
                  >
                    <Pencil size={15} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="pm-delete"
                    onClick={() => removeProduct(product)}
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>

                </div>

              </article>
            ))}

          </div>
        )}

        {/* Pagination */}
        {!productsLoading && products.length > 0 && (
          <div className="pm-pagination">

            <button
              type="button"
              onClick={previousPage}
              disabled={page === 1}
              className="pm-btn pm-btn-light"
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span>
              Page {page}
            </span>

            <button
              type="button"
              onClick={nextPage}
              disabled={!hasMore || productsLoading}
              className="pm-btn pm-btn-light"
            >
              Next
              <ChevronRight size={17} />
            </button>

          </div>
        )}

      </section>
    </div>
  );
}
