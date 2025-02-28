import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { GoogleMapsContext, latLngEquals } from '@vis.gl/react-google-maps';

const useCircle = (props) => {
  const {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onRadiusChanged,
    onCenterChanged,
    radius,
    center,
    ...circleOptions
  } = props;

  const callbacks = useRef({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onRadiusChanged,
    onCenterChanged
  });

  const circle = useRef(new google.maps.Circle()).current;
  circle.setOptions(circleOptions);

  useEffect(() => {
    if (!center) return;
    if (!latLngEquals(center, circle.getCenter())) circle.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (radius === undefined || radius === null) return;
    if (radius !== circle.getRadius()) circle.setRadius(radius);
  }, [radius]);

  const map = useContext(GoogleMapsContext)?.map;

  useEffect(() => {
    if (!map) {
      if (map === undefined) console.error('<Circle> has to be inside a Map component');
      return;
    }

    circle.setMap(map);
    return () => circle.setMap(null);
  }, [map]);

  useEffect(() => {
    if (!circle) return;

    const gme = google.maps.event;
    const listeners = [
      ['click', 'onClick'],
      ['drag', 'onDrag'],
      ['dragstart', 'onDragStart'],
      ['dragend', 'onDragEnd'],
      ['mouseover', 'onMouseOver'],
      ['mouseout', 'onMouseOut']
    ].map(([eventName, eventCallback]) => {
      return gme.addListener(circle, eventName, (e) => {
        const callback = callbacks.current[eventCallback];
        if (callback) callback(e);
      });
    });

    const radiusListener = gme.addListener(circle, 'radius_changed', () => {
      callbacks.current.onRadiusChanged?.(circle.getRadius());
    });
    const centerListener = gme.addListener(circle, 'center_changed', () => {
      callbacks.current.onCenterChanged?.(circle.getCenter());
    });

    return () => {
      listeners.forEach(gme.removeListener);
      gme.removeListener(radiusListener);
      gme.removeListener(centerListener);
    };
  }, [circle]);

  return circle;
};

const Circle = forwardRef((props, ref) => {
  const circle = useCircle(props);
  useImperativeHandle(ref, () => circle);
  return null;
});

export { Circle };