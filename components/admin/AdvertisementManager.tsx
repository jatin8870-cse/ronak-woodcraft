
"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Pencil, Trash2 } from "lucide-react";

import { useStore } from "@/context/StoreContext";
import type { Advertisement } from "@/context/StoreContext";

import ImagePicker from "./ImagePicker";

type AdvertisementForm = {
  title: string;
  tag: string;
  description: string;
  image: string[];
  buttonText: string;
  buttonLink: string;
  couponCode: string;
  discount: string;
  active: boolean;
  sortOrder: string;
  startDate: string;
  endDate: string;
};

const blank: AdvertisementForm = {
  title: "",
  tag: "Special Offer",
  description: "",
  image: [],
  buttonText: "Shop Now",
  buttonLink: "/shop",
  couponCode: "",
  discount: "0",
  active: true,
  sortOrder: "0",
  startDate: "",
  endDate: "",
};

export default function AdvertisementManager() {
  const {
    advertisements,
    saveAdvertisement,
    deleteAdvertisement,
  } = useStore();

  const [f, setF] = useState<AdvertisementForm>({ ...blank });
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Update form fields with proper TypeScript types
  function updateField<K extends keyof AdvertisementForm>(
    key: K,
    value: AdvertisementForm[K]
  ) {
    setF((old) => ({
      ...old,
      [key]: value,
    }));
  }

  // Reset form
  const reset = () => {
    setF({ ...blank, image: [] });
    setEditing(null);
    setMsg("");
  };

  // Submit advertisement
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMsg("");

    if (!f.image.length || !f.image[0]) {
      setMsg("Please upload a banner image.");
      return;
    }

    if (f.startDate && f.endDate) {
      if (new Date(f.endDate) < new Date(f.startDate)) {
        setMsg("End date must be after start date.");
        return;
      }
    }

    setBusy(true);

    try {
      await saveAdvertisement(
        {
          title: f.title.trim(),
          tag: f.tag.trim(),
          description: f.description.trim(),
          image: f.image[0],
          buttonText: f.buttonText.trim(),
          buttonLink: f.buttonLink.trim(),
          couponCode: f.couponCode.trim() || null,
          discount: Number(f.discount),
          active: f.active,
          sortOrder: Number(f.sortOrder),
          startDate: f.startDate
            ? new Date(f.startDate).toISOString()
            : null,
          endDate: f.endDate
            ? new Date(f.endDate).toISOString()
            : null,
        },
        editing?.id
      );

      setMsg(
        editing
          ? "Advertisement updated successfully."
          : "Advertisement added successfully."
      );

      setF({ ...blank, image: [] });
      setEditing(null);
    } catch (err: unknown) {
      setMsg(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setBusy(false);
    }
  };

  // Edit advertisement
  const edit = (a: Advertisement) => {
    setEditing(a);

    setF({
      title: a.title || "",
      tag: a.tag || "",
      description: a.description || "",
      image: a.image ? [a.image] : [],
      buttonText: a.buttonText || "Shop Now",
      buttonLink: a.buttonLink || "/shop",
      couponCode: a.couponCode || "",
      discount: String(a.discount ?? 0),
      active: a.active,
      sortOrder: String(a.sortOrder ?? 0),
      startDate: a.startDate
        ? a.startDate.slice(0, 16)
        : "",
      endDate: a.endDate
        ? a.endDate.slice(0, 16)
        : "",
    });

    setMsg("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Delete advertisement
  const remove = async (a: Advertisement) => {
    const confirmed = window.confirm(
      `Delete "${a.title}"?`
    );

    if (!confirmed) return;

    setMsg("");

    try {
      await deleteAdvertisement(a.id);
      setMsg("Advertisement deleted successfully.");

      if (editing?.id === a.id) {
        reset();
      }
    } catch (err: unknown) {
      setMsg(
        err instanceof Error
          ? err.message
          : "Delete failed."
      );
    }
  };

  return (
    <div className="split">

      {/* Advertisement Form */}
      <form className="form" onSubmit={submit}>

        <h2 style={{ fontSize: "1.2rem" }}>
          {editing
            ? "Edit advertisement"
            : "Add advertisement"}
        </h2>

        {/* Title */}
        <label className="field">
          Advertisement title

          <input
            required
            value={f.title}
            onChange={(e) =>
              updateField("title", e.target.value)
            }
            placeholder="Premium furniture collection"
          />
        </label>

        {/* Tag */}
        <label className="field">
          Tag

          <input
            value={f.tag}
            onChange={(e) =>
              updateField("tag", e.target.value)
            }
            placeholder="Special Offer"
          />
        </label>

        {/* Description */}
        <label className="field">
          Description

          <textarea
            required
            rows={3}
            value={f.description}
            onChange={(e) =>
              updateField("description", e.target.value)
            }
          />
        </label>

        {/* Banner Image */}
        <ImagePicker
          images={f.image}
          onChange={(v) =>
            updateField("image", v.slice(0, 1))
          }
        />

        {/* Button Settings */}
        <div className="two">

          <label className="field">
            Button text

            <input
              required
              value={f.buttonText}
              onChange={(e) =>
                updateField("buttonText", e.target.value)
              }
            />
          </label>

          <label className="field">
            Button link

            <input
              required
              value={f.buttonLink}
              onChange={(e) =>
                updateField("buttonLink", e.target.value)
              }
              placeholder="/shop"
            />
          </label>

        </div>

        {/* Coupon Settings */}
        <div className="two">

          <label className="field">
            Coupon code

            <input
              value={f.couponCode}
              onChange={(e) =>
                updateField("couponCode", e.target.value)
              }
              placeholder="WOOD20"
            />
          </label>

          <label className="field">
            Discount (%)

            <input
              type="number"
              min="0"
              max="100"
              value={f.discount}
              onChange={(e) =>
                updateField("discount", e.target.value)
              }
            />
          </label>

        </div>

        {/* Display Order and Status */}
        <div className="two">

          <label className="field">
            Display order

            <input
              type="number"
              min="0"
              value={f.sortOrder}
              onChange={(e) =>
                updateField("sortOrder", e.target.value)
              }
            />
          </label>

          <label className="field">
            Status

            <select
              value={f.active ? "true" : "false"}
              onChange={(e) =>
                updateField(
                  "active",
                  e.target.value === "true"
                )
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>

        </div>

        {/* Schedule */}
        <div className="two">

          <label className="field">
            Start date

            <input
              type="datetime-local"
              value={f.startDate}
              onChange={(e) =>
                updateField("startDate", e.target.value)
              }
            />
          </label>

          <label className="field">
            End date

            <input
              type="datetime-local"
              value={f.endDate}
              onChange={(e) =>
                updateField("endDate", e.target.value)
              }
            />
          </label>

        </div>

        {/* Form Actions */}
        <div className="row">

          <button
            className="btn"
            type="submit"
            disabled={busy}
          >
            {busy
              ? "Saving..."
              : editing
                ? "Update advertisement"
                : "Add advertisement"}
          </button>

          {editing && (
            <button
              type="button"
              className="btn ghost"
              onClick={reset}
              disabled={busy}
            >
              Cancel
            </button>
          )}

        </div>

        {/* Status Message */}
        {msg && (
          <div className="ok" role="status">
            {msg}
          </div>
        )}

      </form>

      {/* Advertisement List */}
      <div style={{ display: "grid", gap: 12 }}>

        <h2 style={{ fontSize: "1.2rem" }}>
          All advertisements ({advertisements.length})
        </h2>

        {advertisements.map((a) => (
          <div className="line" key={a.id}>

            {/* Thumbnail */}
            <img
              src={a.image}
              alt={a.title}
              style={{
                width: 90,
                height: 70,
                objectFit: "cover",
                borderRadius: 10,
                flex: "none",
              }}
            />

            {/* Advertisement Details */}
            <div className="info">
              <b>{a.title}</b>

              <span className="muted">
                {a.tag} · {a.discount}% discount · Order {a.sortOrder}
              </span>

              <span className="muted">
                {a.active ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Edit */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => edit(a)}
              aria-label={`Edit ${a.title}`}
            >
              <Pencil size={17} />
            </button>

            {/* Delete */}
            <button
              type="button"
              className="icon-btn"
              onClick={() => remove(a)}
              aria-label={`Delete ${a.title}`}
            >
              <Trash2 size={17} />
            </button>

          </div>
        ))}

        {advertisements.length === 0 && (
          <p className="muted">
            No advertisements added yet.
          </p>
        )}

      </div>
    </div>
  );
}
