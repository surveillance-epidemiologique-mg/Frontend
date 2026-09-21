"use client";

import { useEffect, useId, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption { value: string; label: string }

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
}

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase();
}

function selectedStrings(value: string | number | readonly string[] | undefined) {
  if (Array.isArray(value)) return value.map(String);
  return value === undefined || value === null ? [] : [String(value)];
}

export function Select({ label, options, placeholder, error, id, className, value, defaultValue, onChange, disabled, multiple, size, ...props }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const searchId = `${selectId}-search`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const nativeRef = useRef<HTMLSelectElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const [menuReady, setMenuReady] = useState(false);
  const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);
  const searchable = options.length > 5 && !multiple && !size;
  const currentValue = value !== undefined ? value : internalValue;
  const selected = selectedStrings(currentValue);
  const selectedOption = options.find((option) => selected.includes(option.value));
  const visibleOptions = useMemo(() => {
    if (!search.trim()) return options;
    const query = normalizeSearch(search.trim());
    const matches = options.filter((option) => normalizeSearch(option.label).includes(query));
    return options.filter((option) => matches.includes(option) || selected.includes(option.value));
  }, [options, search, selected]);
  const describedBy = [props["aria-describedby"], error ? `${selectId}-error` : undefined].filter(Boolean).join(" ");

  const positionMenu = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const padding = 8;
    const width = Math.min(Math.max(rect.width, 280), window.innerWidth - padding * 2);
    const left = Math.min(Math.max(rect.left, padding), window.innerWidth - width - padding);
    const height = Math.min(384, window.innerHeight - padding * 2);
    const below = rect.bottom + 6;
    const top = below + height <= window.innerHeight - padding || rect.top < height ? below : Math.max(padding, rect.top - height - 6);
    setMenuStyle({ top, left, width });
    setMenuReady(true);
  };

  const openMenu = () => {
    setSearch("");
    setMenuReady(false);
    setPortalHost((triggerRef.current?.closest("dialog[open]") as HTMLElement | null) ?? document.body);
    positionMenu();
    setOpen(true);
  };

  const closeMenu = () => {
    setOpen(false);
    setMenuReady(false);
  };

  useEffect(() => {
    if (!open) return;
    positionMenu();
    const reposition = () => positionMenu();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    const focusTimer = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) closeMenu();
    };
    const closeEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { closeMenu(); triggerRef.current?.focus(); }
    };
    document.addEventListener("mousedown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("mousedown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [open]);

  const emitChange = (nextValue: string) => {
    setInternalValue(nextValue);
    setSearch("");
    if (!nativeRef.current) return;
    nativeRef.current.value = nextValue;
    nativeRef.current.dispatchEvent(new Event("change", { bubbles: true }));
  };

  const handleNativeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setInternalValue(event.target.value);
    onChange?.(event);
  };
  const describedTrigger = describedBy || undefined;
  const triggerLabel = selectedOption?.label ?? placeholder ?? "Sélectionner une option";

  return (
    <div className="w-full min-w-0 space-y-1.5">
      {label ? <label htmlFor={selectId} className="block text-sm font-medium text-text-main">{label}</label> : null}
      {searchable ? <>
        <select {...props} {...(value !== undefined ? { value } : { defaultValue })} ref={nativeRef} id={`${selectId}-native`} disabled={disabled} tabIndex={-1} aria-hidden="true" className="select-native-hidden" onChange={handleNativeChange}>
          {placeholder ? <option value="" disabled>{placeholder}</option> : null}
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <button ref={triggerRef} type="button" id={selectId} disabled={disabled} role="combobox" aria-expanded={open} aria-haspopup="listbox" aria-controls={open ? `${selectId}-menu` : undefined} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedTrigger} className={cn("select-combobox-trigger", className)} onClick={() => { if (open) closeMenu(); else openMenu(); }} onKeyDown={(event) => { if (["Enter", " ", "ArrowDown"].includes(event.key)) { event.preventDefault(); if (!open) openMenu(); } }}>
          <span className={cn("select-combobox-value", !selectedOption && "select-combobox-placeholder")}>{triggerLabel}</span>
          <ChevronDown aria-hidden="true" className={cn("select-combobox-chevron", open && "select-combobox-chevron-open")} />
        </button>
        {open && portalHost ? createPortal(
          <div ref={menuRef} id={`${selectId}-menu`} role="listbox" className="select-combobox-menu" style={{ ...menuStyle, visibility: menuReady ? "visible" : "hidden" }}>
            <div className="select-combobox-search-wrap">
              <Search aria-hidden="true" className="select-combobox-search-icon" />
              <input ref={searchRef} id={searchId} type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une option…" aria-label={label ? `Rechercher dans ${label}` : "Rechercher une option"} className="select-combobox-search" autoComplete="off" />
              {search ? <button type="button" className="select-combobox-clear" onClick={() => { setSearch(""); searchRef.current?.focus(); }} aria-label="Effacer la recherche"><X aria-hidden="true" className="size-4" /></button> : null}
            </div>
            <div className="select-combobox-options">
              {visibleOptions.length ? visibleOptions.map((option) => <button key={option.value} type="button" role="option" aria-selected={selected.includes(option.value)} data-reset={option.value === "" ? "true" : undefined} className={cn("select-combobox-option", selected.includes(option.value) && "select-combobox-option-selected")} onClick={() => { emitChange(option.value); closeMenu(); triggerRef.current?.focus(); }}>{option.label}</button>) : <p className="select-combobox-empty">Aucune option correspondante</p>}
            </div>
          </div>, portalHost,
        ) : null}
      </> : <select {...props} id={selectId} value={value} defaultValue={defaultValue} disabled={disabled} aria-invalid={error ? true : props["aria-invalid"]} aria-describedby={describedBy || undefined} className={cn("w-full", className)} onChange={handleNativeChange}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>}
      {error ? <p id={`${selectId}-error`} className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
