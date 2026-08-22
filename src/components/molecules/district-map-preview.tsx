export function DistrictMapPreview() {
  return (
    <figure className="map-preview">
      <div className="map-preview__header">
        <figcaption>
          <p className="eyebrow">Accessible map foundation</p>
          <h2 className="map-preview__title">
            Three districts, one clear view
          </h2>
        </figcaption>
        <span className="map-preview__status">Source validation pending</span>
      </div>

      <div className="map-preview__canvas" aria-hidden="true">
        <svg className="map-preview__state" viewBox="0 0 260 360">
          <path
            d="M58 14h128l12 51 18 31-14 45 20 42-5 78-33 27-6 54-67-18-44-62-12-78 14-55-19-62z"
            fill="#f7eddc"
            stroke="#0f513f"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M63 94 195 70m-128 92 139-20M79 236l127-41M120 25l-7 301m47-301-5 288"
            fill="none"
            stroke="#88a184"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="m75 195 44-33 36 13 52-33-5 88-47 20-52-16z"
            fill="#c9673f"
            fillOpacity="0.72"
          />
          <circle cx="151" cy="211" r="8" fill="#0f513f" />
        </svg>
      </div>

      <div className="map-preview__legend" aria-label="Planned district layers">
        <span className="map-preview__layer">
          <span className="map-preview__swatch map-preview__swatch--congress" />
          U.S. Congress
        </span>
        <span className="map-preview__layer">
          <span className="map-preview__swatch map-preview__swatch--senate" />
          Nevada Senate
        </span>
        <span className="map-preview__layer">
          <span className="map-preview__swatch map-preview__swatch--assembly" />
          Nevada Assembly
        </span>
      </div>
      <p className="map-preview__note">
        Decorative Phase 1 preview—not an authoritative district map. The live
        map will use versioned official boundaries and provide equivalent text
        results.
      </p>
    </figure>
  );
}
