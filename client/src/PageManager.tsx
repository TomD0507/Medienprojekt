import { useEffect, useState } from "react";
import Login from "./components/Login";
import App from "./App";

import { checkLogin } from "./helpers/loginHelper";
import FilterMenu from "./components/FilterMenu";
import { Header } from "./components/Header";
import BurgerMenu from "./components/BurgerMenu";
import MailModal from "./components/MailModal";
function PageManager() {
  //userID wird bei login gesetzt
  const [userID, setUserID] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const [loginName, setName] = useState("");
  const [password, setPw] = useState("");
  //better login functionality
  //logout a user
  const handleLogout = () => {
    // Clear login info from localStorage
    localStorage.removeItem("userID");
    localStorage.removeItem("displayName");
    localStorage.removeItem("TodoApppassword");
    localStorage.removeItem("TodoApploginName");
    console.log("Logged out.");
    setUserID(null);
    setDisplayName("");
  };
  //loads id an dpname from storage
  useEffect(() => {
    const storedLoginName = localStorage.getItem("TodoApploginName");
    const storedPW = localStorage.getItem("TodoApppassword");

    if (storedLoginName && storedPW) {
      loginFromReload(storedLoginName, storedPW);
    }
  }, []);
  const loginFromReload = async (loginname: string, pw: string) => {
    setStatus("loading");

    const { name, id } = await checkLogin(loginname, pw);
    //id is -1 when the login failed
    const isAuthenticated = id != -1;

    if (isAuthenticated) {
      console.log("Login successful!");
      setStatus("idle");
      setUserID(id);
      setDisplayName(name);
      // Save login info to localStorage
      localStorage.setItem("TodoApppassword", password);
      localStorage.setItem("TodoApploginName", loginName);
    } else {
      console.log("Login failed: incorrect username or password.");
      setStatus("error");
      setUserID(null);
      // Remove login info to localStorage
      localStorage.removeItem("TodoApppassword");
      localStorage.removeItem("TodoApploginName");
    }
    //input reset after login was checked
    handleNameChange("");
    handlePwChange("");
  };

  const handleNameChange = (e: string) => {
    setName(e);
  };

  const handlePwChange = (e: string) => {
    setPw(e);
  };

  const handleSubmit = async () => {
    setStatus("loading");

    const { name, id } = await checkLogin(loginName, password);
    //id is -1 when the login failed
    const isAuthenticated = id != -1;

    if (isAuthenticated) {
      console.log("Login successful!");
      setStatus("idle");
      setUserID(id);
      setDisplayName(name);
      // Save login info to localStorage
      localStorage.setItem("TodoApppassword", password);
      localStorage.setItem("TodoApploginName", loginName);
    } else {
      console.log("Login failed: incorrect username or password.");
      setStatus("error");
    }
    //input reset after login was checked
    handleNameChange("");
    handlePwChange("");
  };

  // from app.tsx
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For Burgermenu
  const [selectedTaskTab, setSelectedTaskTab] = useState("open");

  const [sortArg, setSortArg] = useState("deadline"); //für reihenfolge

  //für mail
  const [mailModal, setMailModal] = useState(false);

  const toggleMailModal = () => {
    setMailModal((mailModal) => !mailModal);
    setIsMenuOpen(!isMenuOpen);
  };
  // filter für closed task
  const [closedFilter, setClosedFilter] = useState("all");

  const [isSearchClosedOpen, setIsSearchClosedOpen] = useState(false);
  function closeClosedOptions() {
    setIsSearchClosedOpen(false);
  }
  const [searchClosedQuery, setSearchClosedQuery] = useState("");
  // filter für open task
  const [openFilter, setOpenFilter] = useState("all");

  const [isSearchOpenOpen, setIsSearchOpenOpen] = useState(false);
  function closeOpenOptions() {
    setIsSearchOpenOpen(false);
  }
  const [searchOpenQuery, setSearchOpenQuery] = useState("");

  return userID === null ? (
    <Login
      name={loginName}
      password={password}
      onNameChange={handleNameChange}
      onPWChange={handlePwChange}
      onSubmit={handleSubmit}
      status={status}
    />
  ) : (
    <div className="app">
      <Header
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onSearchToggle={
          "open" === selectedTaskTab
            ? () => setIsSearchOpenOpen(true)
            : () => setIsSearchClosedOpen(true)
        }
        deleteSearchQuery={
          "done" === selectedTaskTab
            ? () => setSearchClosedQuery("")
            : () => setSearchOpenQuery("")
        }
        delteFilter={
          "done" === selectedTaskTab
            ? () => setClosedFilter("all")
            : () => setOpenFilter("all")
        }
        filter={"done" === selectedTaskTab ? closedFilter : openFilter}
        searchQuery={
          "done" === selectedTaskTab ? searchClosedQuery : searchOpenQuery
        }
        title={
          "done" === selectedTaskTab ? "Erledigte Aufgaben" : "Offene Aufgaben"
        }
      />
      <FilterMenu
        filter={openFilter}
        setFilter={setOpenFilter}
        sortArg={sortArg}
        setSortArg={setSortArg}
        searchQuery={searchOpenQuery}
        setSearchQuery={setSearchOpenQuery}
        isMenuOpen={isSearchOpenOpen}
        closeMenu={closeOpenOptions}
        placeholder={"Durchsuche deine offenen Aufgaben:"}
      />
      <FilterMenu
        filter={closedFilter}
        setFilter={setClosedFilter}
        sortArg={sortArg}
        setSortArg={setSortArg}
        searchQuery={searchClosedQuery}
        setSearchQuery={setSearchClosedQuery}
        isMenuOpen={isSearchClosedOpen}
        closeMenu={closeClosedOptions}
        placeholder={"Durchsuche deine erledigten Aufgaben:"}
      />

      <BurgerMenu
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onLogout={handleLogout}
        toggleMailModal={toggleMailModal}
      ></BurgerMenu>
      {/** Mail Modal */}
      {mailModal && (
        <MailModal
          thisMailModal={mailModal}
          toggleMailModal={toggleMailModal}
        ></MailModal>
      )}
      <App
        userID={userID}
        displayName={displayName}
        isMenuOpen={isMenuOpen}
        isSearchOpenOpen={isSearchOpenOpen}
        isSearchClosedOpen={isSearchClosedOpen}
        mailModal={mailModal}
        closedFilter={closedFilter}
        searchClosedQuery={searchClosedQuery}
        openFilter={openFilter}
        searchOpenQuery={searchOpenQuery}
        selectedTaskTab={selectedTaskTab}
        setSelectedTaskTab={setSelectedTaskTab}
        sortArg={sortArg}
      />
    </div>
  );
}

export default PageManager;
