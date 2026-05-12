import React, { useState } from 'react';
import './RouteForm.css';

function RouteForm({ onSubmit, initialValues, disabled }) {
  const [title, setTitle] = useState(initialValues ? initialValues.title : '');
  const [distanceMiles, setDistanceMiles] = useState(initialValues ? initialValues.distanceMiles : '');
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [address, setAddress] = useState(initialValues ? initialValues.address : '');
  const [errors, setErrors] = useState({});

  function validate() {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Title is required';
    } else if (title.length > 255) {
      errs.title = 'Title must be 255 characters or fewer';
    }
    const dist = parseFloat(distanceMiles);
    if (!distanceMiles) {
      errs.distanceMiles = 'Distance is required';
    } else if (isNaN(dist) || dist < 0.5 || dist > 26.2) {
      errs.distanceMiles = 'Distance must be between 0.5 and 26.2 miles';
    }
    if (!useCurrentLocation && !address.trim()) {
      errs.address = 'Please enter an address or use your current location';
    }
    return errs;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    onSubmit({
      title: title.trim(),
      distanceMiles: parseFloat(distanceMiles),
      useCurrentLocation,
      address: address.trim(),
    });
  }

  return (
    <form className="route-form" onSubmit={handleSubmit} noValidate>
      <div className="route-form__field">
        <label className="route-form__label" htmlFor="route-title">
          Route Title
        </label>
        <input
          id="route-title"
          className={`route-form__input${errors.title ? ' route-form__input--error' : ''}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Morning 5K"
          maxLength={255}
          disabled={disabled}
        />
        {errors.title && <p className="route-form__error">{errors.title}</p>}
      </div>

      <div className="route-form__field">
        <label className="route-form__label" htmlFor="route-distance">
          Distance (miles)
        </label>
        <input
          id="route-distance"
          className={`route-form__input${errors.distanceMiles ? ' route-form__input--error' : ''}`}
          type="number"
          min="0.5"
          max="26.2"
          step="0.1"
          value={distanceMiles}
          onChange={(e) => setDistanceMiles(e.target.value)}
          placeholder="e.g. 3.1"
          disabled={disabled}
        />
        {errors.distanceMiles && <p className="route-form__error">{errors.distanceMiles}</p>}
      </div>

      <div className="route-form__field">
        <label className="route-form__label">Start / Finish Location</label>
        <div className="route-form__location-toggle">
          <button
            type="button"
            className={`route-form__toggle-btn${!useCurrentLocation ? ' route-form__toggle-btn--active' : ''}`}
            onClick={() => setUseCurrentLocation(false)}
            disabled={disabled}
          >
            Enter Address
          </button>
          <button
            type="button"
            className={`route-form__toggle-btn${useCurrentLocation ? ' route-form__toggle-btn--active' : ''}`}
            onClick={() => setUseCurrentLocation(true)}
            disabled={disabled}
          >
            Use My Location
          </button>
        </div>
        {!useCurrentLocation && (
          <input
            id="route-address"
            className={`route-form__input${errors.address ? ' route-form__input--error' : ''}`}
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. 123 Main St, Springfield, IL"
            disabled={disabled}
          />
        )}
        {errors.address && <p className="route-form__error">{errors.address}</p>}
      </div>

      <button type="submit" className="route-form__submit" disabled={disabled}>
        Generate Route
      </button>
    </form>
  );
}

export default RouteForm;
