import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys a contract named "ArtProject01" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployArtProject01: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // For ArtProject01, we need to provide the following constructor arguments:
  // name_, symbol_, contractOwner, contractAdmin, externalWallet
  const name = "ArtProject01";
  const symbol = "ART01";
  const contractOwner = deployer;
  const contractAdmin = deployer; // Using deployer as admin for local testing
  const externalWallet = deployer; // Using deployer as external wallet for local testing

  await deploy("ArtProject01", {
    from: deployer,
    // Contract constructor arguments
    args: [name, symbol, contractOwner, contractAdmin, externalWallet],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract to interact with it after deploying.
  const artProject01 = await hre.ethers.getContract<Contract>("ArtProject01", deployer);
  console.log("🎨 ArtProject01 deployed successfully!");
  console.log("📊 Current price:", (await artProject01.currentPrice()).toString());
};

export default deployArtProject01;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags ArtProject01
deployArtProject01.tags = ["ArtProject01"];
