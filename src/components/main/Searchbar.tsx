import React, { useEffect, useRef, useState } from "react";
import { IRootState } from "../../redux/store";
import { useDispatch, useSelector } from "react-redux";
import { IoCloseOutline, IoSearchOutline } from "../icon/Icons";
import { IoClose } from "../icon/Icons";
import { closeSearch } from "../../redux/slice/sidebar";
import { useDebouncer } from "../../hooks/useDobuncer";
import { useLazySearchQuery } from "../../redux/api/user.api";
import { ISearchUsersResponse } from "../../types";
import { Null } from "../../utlis";
import User from "../../assets/images/user.png";
import SearchSpinner from "../../utils/loaders/SearchSpinner";
import Skeleton from "../../utils/loaders/Skeleton";
import { useNavigate } from "react-router-dom";

const Searchbar = () => {
  const state = useSelector((state: IRootState) => state.sidebar);
  const isMobile = useSelector((state: IRootState) => state.mobile.open);
  const refDiv = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!refDiv.current?.contains(e.target as HTMLElement)) {
        dispatch(closeSearch());
      }
    };
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  useEffect(() => {
    if (!state.search) {
      setSearch("");
    }
  }, [state]);

  const [showLens, setShowLens] = useState<boolean>(true);
  const [dis, setDis] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<ISearchUsersResponse[]>([]);
  const [search, setSearch] = useState<string>("");

  const [searchUsers] = useLazySearchQuery();

  const mainSearch = useDebouncer(search);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement, Element>) => {
    if (!showLens) {
      setShowLens(true);
    }
  };

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        if (mainSearch.length) {
          const { data } = await searchUsers(mainSearch);
          if (data) {
            setLoading(false);
            return setUsers(data.data);
          }
        } else {
          setLoading(false);
          return setUsers([]);
        }
      } catch {
        setLoading(false);
        return setUsers([]);
      }
    };
    getUsers();
  }, [mainSearch]);

  return (
    <div
      className="search"
      ref={refDiv}
      style={{
        width:
          state.search && isMobile
            ? "100%"
            : state.search && !isMobile
            ? "26%"
            : "0%",
        left: !state.search ? "-10%" : "5.5%",
      }}
    >
      <div
        className="search-top"
        style={{
          borderBottom: !mainSearch.length
            ? "1px solid rgb(219,219,219)"
            : "none",
        }}
      >
        <h1>Search</h1>
        {isMobile ? (
          <span
            onClick={() => dispatch(closeSearch())}
            className="mobile-search-close"
          >
            <IoCloseOutline />
          </span>
        ) : undefined}
        <div className="search-bar">
          {showLens && !dis && <IoSearchOutline />}
          <input
            disabled={dis}
            className="s1"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            onBlur={handleBlur}
            onFocus={() => setShowLens(false)}
            type="text"
            placeholder="Search"
          />
          {!showLens && !loading ? (
            <span
              tabIndex={1}
              onBlur={() => setDis(false)}
              onMouseEnter={() => setDis(true)}
              onClick={() => search && setSearch("")}
            >
              <IoClose />
            </span>
          ) : !showLens && loading ? (
            <SearchSpinner />
          ) : undefined}
        </div>
      </div>
      {mainSearch.length ? (
        <div className="search-result-box">
          {users.length && !loading ? (
            users.map((el) => (
              <div
                onClick={() => {
                  setSearch("");
                  navigate(`/${el._id}`);
                }}
                className="search-result"
                key={el._id}
              >
                <img
                  src={el.avatar.url !== Null ? el.avatar.url : User}
                  alt=""
                />
                <div>
                  <span>{el.name}</span>
                  <p>{el.username}</p>
                </div>
              </div>
            ))
          ) : !loading && !users.length ? (
            <div className="no-result">No results found.</div>
          ) : (
            new Array(10).fill(0).map((el, i) => (
              <div className="search-result skeleton-search" key={i}>
                <Skeleton height="44px" width="44px" variant="Circular" />
                <div>
                  <Skeleton height="14px" width="240px" variant="Rounded" />
                  <Skeleton height="14px" width="200px" variant="Rounded" />
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="recent-search">
          <h4>Recent</h4>
          <span>No recent searches.</span>
        </div>
      )}
    </div>
  );
};

export default Searchbar;
