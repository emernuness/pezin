'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function FilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = React.useState(searchParams.get('search') || '');
  const [sort, setSort] = React.useState(searchParams.get('sort') || 'recent');
  const [minPrice, setMinPrice] = React.useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('maxPrice') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (sort && sort !== 'recent') params.set('sort', sort);
    if (minPrice) {
      // Convert R$ to cents
      const minCents = Math.round(parseFloat(minPrice) * 100);
      if (!isNaN(minCents) && minCents > 0) params.set('minPrice', minCents.toString());
    }
    if (maxPrice) {
      // Convert R$ to cents
      const maxCents = Math.round(parseFloat(maxPrice) * 100);
      if (!isNaN(maxCents) && maxCents > 0) params.set('maxPrice', maxCents.toString());
    }

    // Reset page on filter change
    params.set('page', '1');

    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.set('page', '1');
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('recent');
    router.push('/');
  };

  const hasActiveFilters = search || minPrice || maxPrice || sort !== 'recent';

  return (
    <div className="mb-8 space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2 md:max-w-md">
          <Input
            placeholder="Buscar packs ou criadores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Buscar</Button>
        </form>

        <div className="flex gap-2">
          <div className="w-full md:w-48">
            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais Recentes</SelectItem>
                <SelectItem value="popular">Populares</SelectItem>
                <SelectItem value="price_asc">Menor Preço</SelectItem>
                <SelectItem value="price_desc">Maior Preço</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Preço:</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min (R$)"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-24"
              min="0"
              step="0.01"
            />
            <span className="text-gray-400">-</span>
            <Input
              type="number"
              placeholder="Max (R$)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-24"
              min="0"
              step="0.01"
            />
            <Button type="button" variant="secondary" size="sm" onClick={applyFilters}>
              Filtrar
            </Button>
          </div>
        </div>

        {hasActiveFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
}
