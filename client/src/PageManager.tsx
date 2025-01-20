import { useEffect, useState } from "react";
import Login from "./components/Login";
import App from "./App";

import { checkLogin, loginData } from "./helpers/loginHelper";
import FilterMenu from "./components/FilterMenu";
import { Header } from "./components/Header";
import BurgerMenu from "./components/BurgerMenu";
import MailModal from "./components/MailModal";

import { PixelWall } from "./pwall/PixelWall";
import { SwapHeader } from "./components/SwapHeader";
import { PwallHeader } from "./components/PwallHeader";
function PageManager() {
  //userID wird bei login gesetzt
  const [userID, setUserID] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const [loginName, setName] = useState("");
  const [password, setPw] = useState("");
  //logout a user
  const handleLogout = () => {
    // Clear login info from localStorage
    localStorage.removeItem("userID");
    localStorage.removeItem("displayName");
    localStorage.removeItem("TodoApppassword");
    localStorage.removeItem("TodoApploginName");
    console.log("Logged out.");
    setUserID(null);
    setIsMenuOpen(false);
  };
  //login functions
  //Load prior used login data
  useEffect(() => {
    const storedLoginName = localStorage.getItem("TodoApploginName");
    const storedPW = localStorage.getItem("TodoApppassword");

    if (storedLoginName && storedPW) {
      setName(storedLoginName);
      setPw(storedPW);
      login(storedLoginName, storedPW);
    }
  }, []);
  const login = async (loginname: string, pw: string) => {
    setStatus("loading");

    // Initialize default values for loginData
    let loginData: loginData = {
      id: -1,
      mode: 0,
      pixels: 0,
    };

    try {
      // Assume checkLogin is a function that returns a promise resolving to LoginData
      loginData = await checkLogin(loginname, pw);
    } catch (error) {
      console.error("Error during login:", error);
      setStatus("error");
    }

    // Destructure loginData if needed
    const { id, mode, pixels } = loginData;
    //id is -1 when the login failed
    const isAuthenticated = id != -1;

    if (isAuthenticated) {
      console.log("Login successful!");
      setStatus("idle");
      setMode(mode);
      setPixelCount(pixels);
      setUserID(id);
      // Save login info to localStorage
      localStorage.setItem("TodoApppassword", pw);
      localStorage.setItem("TodoApploginName", loginname);
    } else {
      console.log("Login failed: incorrect username or password.");
      setStatus("error");
      setUserID(null);
      handleNameChange("");
      handlePwChange("");
      // Remove login info to localStorage
      localStorage.removeItem("TodoApppassword");
      localStorage.removeItem("TodoApploginName");
    }
    //input reset after login was checked
  };
  const handleNameChange = (e: string) => {
    setName(e);
  };
  const handlePwChange = (e: string) => {
    setPw(e);
  };
  const handleSubmit = async () => {
    login(loginName, password);
  };

  // from app.tsx
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For Burgermenu
  const [selectedTaskTab, setSelectedTaskTab] = useState("open"); // welche liste genutzt wird
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

  //pixelwall vars
  const [pixelCount, setPixelCount] = useState(0);
  function addPixels(p: number): void {
    if ((p = 0)) return;
    setPixelCount((prev) => {
      return prev + p;
    });
  }
  //wheter or not the strategie page(true) should be visible or the app(false)
  const [motStrat, setMotStrat] = useState(false);
  //mode
  const [mode, setMode] = useState(0);
  return userID === null ? (
    <Login
      name={loginName}
      password={password}
      onNameChange={handleNameChange}
      onPWChange={handlePwChange}
      onSubmit={handleSubmit}
      status={status}
    />
  ) : mode === 0 ? (
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
        showBurger={true}
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
          name={loginName}
          password={password}
        ></MailModal>
      )}
      <App
        userID={userID}
        name={loginName}
        password={password}
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
        returnHook={addPixels}
      />
    </div>
  ) : (
    <div className="app">
      <SwapHeader
        firstChild={
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
              "done" === selectedTaskTab
                ? "Erledigte Aufgaben"
                : "Offene Aufgaben"
            }
            showBurger={true}
          />
        }
        secondChild={<PwallHeader remainingPixel={pixelCount} />}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        showSecondChild={motStrat}
        setShowSecondChild={setMotStrat}
      ></SwapHeader>
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
          name={loginName}
          password={password}
        ></MailModal>
      )}
      {!motStrat && (
        <App
          userID={userID}
          name={loginName}
          password={password}
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
          returnHook={addPixels}
        />
      )}
      {motStrat && (
        <PixelWall
          currentUserID={userID}
          remainingPixel={pixelCount}
          username={loginName}
          password={password}
        />
      )}
    </div>
  );
}

export default PageManager;
