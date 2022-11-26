const { network } = require("hardhat");
const { networkConfig } = require("../helper-hardhat-config");
const { developmentChains } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
require("dotenv").config();

//const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = await getChainId();

	let ethUsdPriceFeedAddress;

	if (developmentChains.includes(network.name)) {
		const ethIsdPriceFeedAggregator = await deployments.get(
			"MockV3Aggregator"
		);
		ethUsdPriceFeedAddress = ethIsdPriceFeedAggregator.address;
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
	}

	const args = [ethUsdPriceFeedAddress];
	const fundMe = await deploy("FundMe", {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(fundMe.address, args);
	}

	log("----------------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
