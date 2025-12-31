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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (search) params.set('search', search);
    else params.delete('search');

    // Reset page on new search
    params.set('page', '1');

    router.push(`/?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <form onSubmit={handleSearch} className="flex flex-1 gap-2 md:max-w-md">
        <Input
          placeholder="Buscar packs ou criadores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">Buscar</Button>
      </form>

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
  );
}
