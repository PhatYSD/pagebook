import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useState, useEffect, ChangeEvent, FocusEvent } from "react";

import searchApi from "../apis/get_search";

interface ResultSearch {
  message: string;
  users: {
    username: string;
    id: string;
    avatarUrl: string;
  }[]
  posts: {
    title: string;
    id: string;
    imageUrl: string;
  }[]
}

const Navbar = () => {
  const [search, setSearch] = useState<string | null>(null);
  const [focus, setFocus] = useState<boolean>(false);
  const [resultSearch, setResultSearch] = useState<ResultSearch>({
    message: "",
    users: [],
    posts: []
  });
  const { t } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  }
  const handleFocusBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (event.type === "focus") {
      setFocus(true);
    }
    if (event.type === "blur") {
      setTimeout(() => {
        setFocus(false);
      }, 250);
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (search !== null && search !== "") {
        const response = await searchApi(search);

        setResultSearch(response);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  return (
    <nav className="w-full h-[60px] bg-white shadow top-0 left-0 fixed z-40">
      <div className="container h-full w-full max-w-screen-lg mx-auto flex justify-center sm:justify-between items-center">
        <Link className="hidden sm:block" to="/">
          <h1 className="text-5xl">PAGEBOOK</h1>
        </Link>
        <div className="h-full relative flex justify-center items-center me-4">
          <div className="flex justify-end items-center border-2 border-black rounded-full">
            <input type="text" placeholder={`${t("search")}...`} value={search || ""} onChange={handleChange} onFocus={handleFocusBlur} onBlur={handleFocusBlur} className="h-[36px] w-[256px] text-xl bg-[#F4F4F4] text-center outline-none border-none rounded-s-full" />
            <div className="h-[36px] w-[36px] bg-black flex justify-center items-center rounded-e-full">
              <FaSearch className="text-xl font-black text-white" />
            </div>
          </div>
          {
            focus && (resultSearch.posts.length !== 0 || resultSearch.users.length !== 0) && (
              <div className="w-full max-h-[60vh] overflow-y-auto bg-white absolute top-full right-0 border-2 border-black border-t-0 rounded-b">
                <div>
                  {
                    resultSearch.users.length > 0 ? <h3 className="text-sm mb-2 ms-4">Account</h3> : null
                  }
                  <hr className="w-11/12 mx-auto" />
                  {
                    resultSearch.users.map((value) => {
                      return (
                        <Link reloadDocument={true} className="h-14 w-full cursor-pointer my-1 hover:bg-slate-200 transition-colors flex justify-start items-center overflow-hidden" to={`/profile/${value.id}`} key={value.id}>
                          <div className="h-12 px-2 flex justify-start items-center gap-2">
                            <div className="h-full">
                              <div style={{ backgroundImage: `url("${value.avatarUrl}")` }} className={`h-full w-12 rounded-full bg-no-repeat bg-cover bg-center`}></div>
                            </div>
                            <div>{value.username}</div>
                          </div>
                        </Link>
                      )
                    })
                  }
                </div>
                <div>
                  {
                    resultSearch.posts.length > 0 ? <h3 className="text-sm mb-2 ms-4">Post</h3> : null
                  }
                  <hr className="w-11/12 mx-auto" />
                  {
                    resultSearch.posts.map(value => (
                      <div className="h-14 w-full cursor-pointer my-1 hover:bg-slate-200 transition-colors flex justify-start items-center" onClick={() => alert("oncoming!")} key={value.id}>
                        <div className="h-12 px-2 flex justify-start items-center gap-2">
                          <div className="h-full">
                            <div style={{ backgroundImage: `url("${value.imageUrl}")` }} className={`h-full w-12 bg-no-repeat bg-cover bg-center`}></div>
                          </div>
                          <div>{value.title}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )
          }
        </div>
      </div>
    </nav>
  )
}

export default Navbar;