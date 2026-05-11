import React from 'react';
import RouteCard from '../RouteCard/RouteCard';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import './RouteList.css';

function RouteList({ routes, pendingDeleteId, onDeleteRequest, onDeleteConfirm, onDeleteCancel, onView }) {
  return (
    <section className="route-list">
      <h2 className="route-list__heading">Saved Routes</h2>
      {routes.length === 0 ? (
        <p className="route-list__empty">No routes yet. Add one to get started! 👻</p>
      ) : (
        <ul className="route-list__items">
          {routes.map((route) => (
            <li key={route.id}>
              <RouteCard route={route} onDeleteRequest={onDeleteRequest} onView={onView} />
            </li>
          ))}
        </ul>
      )}
      {pendingDeleteId && (
        <ConfirmDialog
          onConfirm={() => onDeleteConfirm(pendingDeleteId)}
          onCancel={onDeleteCancel}
        />
      )}
    </section>
  );
}

export default RouteList;
