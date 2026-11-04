"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FiLoader, FiSearch, FiX } from "react-icons/fi";

// A search box that filters as you type. Each pause in typing puts the text
// in the URL as `?q=`; the server then re-renders the list with that filter,
// so bookmarks and the back button keep working and nothing is filtered in
// the browser. Enter applies at once; the × clears. `drop` names URL params
// to remove on a new search (one-off banners, page numbers).
const DELAY_MS = 300;

export default function SearchBox({
  param = "q",
  drop = ["notice", "error", "page"],
  placeholder = "Search",
  label = "Search",
  className = "",
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get(param) ?? "";
  const [value, setValue] = useState(fromUrl);
  const [pending, startTransition] = useTransition();
  const timer = useRef(null);

  // Keep the box in step when the URL changes some other way (tab link, back).
  useEffect(() => {
    setValue(fromUrl);
  }, [fromUrl]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const apply = (next) => {
    clearTimeout(timer.current);
    const trimmed = next.trim();
    if (trimmed === fromUrl.trim()) return;
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) params.set(param, trimmed);
    else params.delete(param);
    for (const key of drop) params.delete(key);
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  };

  const onChange = (event) => {
    const next = event.target.value;
    setValue(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => apply(next), DELAY_MS);
  };

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        apply(value);
      }}
      className={`relative ${className}`}
    >
      {pending ? (
        <FiLoader
          className="text-brand pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 animate-spin"
          aria-hidden="true"
        />
      ) : (
        <FiSearch
          className="text-slate-soft pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2"
          aria-hidden="true"
        />
      )}
      <input
        type="search"
        name={param}
        value={value}
        onChange={onChange}
        maxLength={80}
        placeholder={placeholder}
        aria-label={label}
        autoComplete="off"
        className="border-mist text-ink placeholder:text-slate-soft focus:border-brand focus:ring-brand/20 h-9 w-full rounded-full border bg-white pr-9 pl-10 text-sm outline-none focus:ring-2 sm:w-72 [&::-webkit-search-cancel-button]:appearance-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            setValue("");
            apply("");
          }}
          aria-label="Clear search"
          className="text-slate-soft hover:text-ink absolute top-1/2 right-2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full"
        >
          <FiX className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {pending ? "Searching" : ""}
      </span>
    </form>
  );
}
