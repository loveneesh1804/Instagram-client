import React, { useEffect, useState } from "react";
import { IUseInfiniteScroll } from "../types";

const useInfiniteScroll = <T extends {}>({
  containerRef,
  page,
  setPage,
  totalPage = 1,
  messages = [],
}: IUseInfiniteScroll<T>) => {
  const [data, setData] = useState<T[]>([]);

  useEffect(() => {
    let observer: IntersectionObserver;
    let target: HTMLDivElement;
    if (containerRef.current && page < totalPage) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            observer.unobserve(target as HTMLDivElement);
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 1 }
      );

      target = containerRef.current.querySelector(
        ":first-child"
      ) as HTMLDivElement;
      if (!target) return;

      observer.observe(target);
    }
    return () => {
      if (target) observer.unobserve(target);
      if (observer) observer.disconnect();
    };
  }, [data]);

  useEffect(() => {
    if (messages.length && page <= totalPage) {
      const timeoutId = setTimeout(() => {
        setData((prev) => {
          const newData = [...messages, ...prev];
          return JSON.stringify(newData) === JSON.stringify(prev)
            ? prev
            : newData;
        });
      }, 150);

      return () => clearTimeout(timeoutId);
    }
  }, [messages]);

  return { data, setData };
};

export default useInfiniteScroll;
