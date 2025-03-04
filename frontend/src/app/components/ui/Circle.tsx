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
  className?: string;
  children?: React.ReactNode;
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!circle) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = circle.getArray()[0].getPath().getArray()[Math.floor(circle.getPathLength() / 2)];
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const rotation = angle + 90;
      circle.getPath().forEach(function(point: google.maps.LatLng) {
        point.set(point.lat() + (x / width) * 0.001, point.lng() + (y / width) * 0.001);
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [circle]);

  useEffect(() => {
    const handleMouseLeave = (): void => {
      if (!circle) return;
      circle.getPath().forEach(function(point: google.maps.LatLng) {
        point.set(point.lat() - (x / width) * 0.001, point.lng() - (y / width) * 0.001);
      });
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    return () => window.removeEventListener("mouseleave", handleMouseLeave);
  }, [circle]);

  return circle;
};

const Circle: React.FC<CircleProps> = ({ className, children }) => {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      if (!circleRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = circleRef.current.getBoundingClientRect();
      const x = clientX - left - width / 2;
      const y = clientY - top - height / 2;
      const angle = Math.atan2(y, x) * (180 / Math.PI);
      const rotation = angle + 90;
      circleRef.current.style.transform = `rotate(${rotation}deg)`;
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (): void => {
      if (!circleRef.current) return;
      circleRef.current.style.transform = "rotate(0deg)";
    };

    window.addEventListener("mouseleave", handleMouseLeave);
    return () => window.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  return (
    <div
      ref={circleRef}
      className={`w-[200px] h-[200px] rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
};

Circle.displayName = "Circle";

export default Circle;
