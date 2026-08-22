import { Search } from "lucide-react";

import { Button } from "@/components/atoms/button";

export function AddressLookup() {
  return (
    <form className="address-lookup" aria-labelledby="lookup-label">
      <label
        className="address-lookup__label"
        id="lookup-label"
        htmlFor="nevada-address"
      >
        Find who represents you
      </label>
      <div className="address-lookup__control">
        <input
          className="address-lookup__field"
          id="nevada-address"
          name="address"
          type="text"
          autoComplete="street-address"
          placeholder="Enter your Nevada address"
          aria-describedby="lookup-hint"
          disabled
        />
        <Button type="button" size="large" disabled>
          <Search aria-hidden="true" size={18} />
          Private alpha coming next
        </Button>
      </div>
      <p className="address-lookup__hint" id="lookup-hint">
        This Phase 1 shell does not transmit or store input. Geographic lookup
        is enabled only after official boundary validation.
      </p>
    </form>
  );
}
