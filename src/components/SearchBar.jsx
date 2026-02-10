/**
 * Search bar and filters for TV series discovery.
 * Search by title; filter by year and genre (client-side on current results).
 */
export default function SearchBar({
  query,
  onQueryChange,
  onSearch,
  year,
  onYearChange,
  genre,
  onGenreChange,
  genresFromResults,
  isLoading,
  disabled,
}) {
  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search" aria-label="Search shows">
      <div className="search-bar__row">
        <input
          type="search"
          className="search-bar__input"
          placeholder="Search TV series…"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onBlur={() => query.trim() && onSearch(query)}
          disabled={disabled}
          aria-label="Search by title"
          autoComplete="off"
        />
        <button
          type="submit"
          className="search-bar__btn"
          disabled={disabled || isLoading}
          aria-label="Search"
        >
          {isLoading ? '…' : 'Search'}
        </button>
      </div>
      <div className="search-bar__filters">
        <input
          type="text"
          className="search-bar__year"
          placeholder="Year"
          value={year}
          onChange={(e) => onYearChange(e.target.value)}
          disabled={disabled}
          aria-label="Filter by release year"
          inputMode="numeric"
        />
        <select
          className="search-bar__genre"
          value={genre}
          onChange={(e) => onGenreChange(e.target.value)}
          disabled={disabled}
          aria-label="Filter by genre"
        >
          <option value="">All genres</option>
          {genresFromResults.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>
    </form>
  )
}
