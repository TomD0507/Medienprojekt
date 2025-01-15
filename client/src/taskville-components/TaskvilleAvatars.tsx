const headAssets = [
  { path: "/src/assets/Taskville/head-testZagreus.png", title: "headZagreus" },
  { path: "/src/assets/Taskville/head-testMelinoe.png", title: "headMelinoe" },
  {
    path: "/src/assets/Taskville/head-testPrometheus.png",
    title: "headPrometheus",
  },
  { path: "/src/assets/Taskville/head-testHades.png", title: "headHades" },
];

const bodyAssets = [
  {
    path: "/src/assets/Taskville/body-testSpongebob.png",
    title: "bodySpongebob",
  },
  {
    path: "/src/assets/Taskville/body-testSquidward.png",
    title: "bodySquidward",
  },
  { path: "/src/assets/Taskville/body-testKrabs.png", title: "bodyKrabs" },
  {
    path: "/src/assets/Taskville/body-testPlankton.png",
    title: "bodyPlankton",
  },
];

const legAssets = [
  { path: "/src/assets/Taskville/leg-testAragorn.png", title: "legAragorn" },
  { path: "/src/assets/Taskville/leg-testLegolas.png", title: "legLegolas" },
  { path: "/src/assets/Taskville/leg-testGimmli.png", title: "legGimmli" },
  { path: "/src/assets/Taskville/leg-testGandalf.png", title: "legGandalf" },
];

interface TaskvilleAvatarProps {
  userID: number;
}

export default function TaskvilleAvatars(userID: TaskvilleAvatarProps) {
  console.log(userID);
  return (
    <div className="avatar-grid">
      {headAssets.map((_, assetIndex) => (
        <div className="avatar" key={assetIndex}>
          <h1 style={{ color: "white" }}>User {assetIndex}</h1>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundImage: `url(${headAssets[assetIndex].path})`,
            }}
          ></div>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundImage: `url(${bodyAssets[assetIndex].path})`,
            }}
          ></div>
          <div
            style={{
              width: "100px",
              height: "100px",
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundImage: `url(${legAssets[assetIndex].path})`,
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
