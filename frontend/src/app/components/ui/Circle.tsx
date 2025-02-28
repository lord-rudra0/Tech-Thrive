import React, { forwardRef, useContext, useEffect, useImperativeHandle, useRef } from 'react';
import { GoogleMapsContext, latLngEquals } from '@vis.gl/react-google-maps';

interface CircleProps extends google.maps.CircleOptions {
  onClick?: (event: google.maps.MapMouseEvent) => void;
  onDrag?: (event: google.maps.MapMouseEvent) => void;
  onDragStart?: (event: google.maps.MapMouseEvent) => void;
  onDragEnd?: (event: google.maps.MapMouseEvent) => void;
  onMouseOver?: (event: google.maps.MapMouseEvent) => void;
  onMouseOut?: (event: google.maps.MapMouseEvent) => void;
  onRadiusChanged?: (radius: number) => void;
  onCenterChanged?: (center: google.maps.LatLng | null) => void;
}

const useCircle = (props: CircleProps) => {
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

  const callbacks = useRef<{ [key: string]: Function | undefined }>({});
  Object.assign(callbacks.current, {
    onClick,
    onDrag,
    onDragStart,
    onDragEnd,
    onMouseOver,
    onMouseOut,
    onRadiusChanged,
    onCenterChanged,
  });

  const circle = useRef<google.maps.Circle>(new google.maps.Circle()).current;
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
    const listeners = (
      [
        ['click', 'onClick'],
        ['drag', 'onDrag'],
        ['dragstart', 'onDragStart'],
        ['dragend', 'onDragEnd'],
        ['mouseover', 'onMouseOver'],
        ['mouseout', 'onMouseOut'],
      ] as const
    ).map(([eventName, eventCallback]) => {
      return gme.addListener(circle, eventName, (event: google.maps.MapMouseEvent) => {
        const callback = callbacks.current[eventCallback];
        if (callback) callback(event);
      });
    });

    const radiusListener = gme.addListener(circle, 'radius_changed', () => {
      callbacks.current.onRadiusChanged?.(circle.getRadius());
    });
    const centerListener = gme.addListener(circle, 'center_changed', () => {
      callbacks.current.onCenterChanged?.(circle.getCenter());
    });

    return () => {
      listeners.forEach((listener) => gme.removeListener(listener));
      gme.removeListener(radiusListener);
      gme.removeListener(centerListener);
    };
  }, [circle]);

  return circle;
};

const Circle = forwardRef<google.maps.Circle, CircleProps>((props, ref) => {
  const circle = useCircle(props);
  useImperativeHandle(ref, () => circle);
  return null;
});

export { Circle };
