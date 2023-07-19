import Upbond, { BuildEnv } from "@upbond/upbond-embed";
import Web3 from "web3";
import Web3Token from "web3-token";
import { ethers } from "ethers";
import { toast } from "react-hot-toast";

class UpbondEmbed {
  // Initials
  upbond: Upbond;

  web3: Web3 | null = null;

  // you can also use another envs.
  env = `${process.env.NODE_ENV || "production"}`; // may be development | staging | production

  isLoggedIn = false;

  initialized = false;

  constructor() {
    this.upbond = new Upbond({});
    this.web3 = new Web3();
  }

  async init(dappRedirectPath: string = "") {
    console.log('UPBOND Embed Initializing...');
    if (this.upbond instanceof Upbond) {
      await this.upbond.init({
        buildEnv: this.env as BuildEnv,
        widgetConfig: {
          showAfterLoggedIn: false,
          showBeforeLoggedIn: false,
        },
        dappRedirectUri: `${window.location.origin}/${dappRedirectPath}`,
        network: {
          host: "mumbai",
          chainId: 80001,
          networkName: "Mumbai",
          blockExplorer: "",
          ticker: "MUMBAI",
          tickerName: "MUMBAI",
          rpcUrl: "https://polygon-testnet.public.blastapi.io/",
        },
        whiteLabel: {
          walletTheme: {
            logo: "https://i.ibb.co/L6vHB5d/company-logo-sample.png",
            name: "Company",
            buttonLogo:
              "https://i.ibb.co/wBmybLc/company-button-logo-sample.png",
            isActive: true,
            modalColor: "#fffff",
            bgColor: "#4B68AE",
            bgColorHover: "#214999",
            textColor: "#f3f3f3",
            textColorHover: "#214999",
            upbondLogin: {
              globalBgColor: "#ffffff",
              globalTextColor: "#4B68AE",
            },
          },
        },
      });
      console.log('UPBOND Embed initialized!');
      this.initialized = true;
    }
  }

  async login() {
    console.log('UPBOND Embed Logging in...');
    try {
      if (this.upbond instanceof Upbond && this.web3 instanceof Web3) {
        const _provider = await this.upbond.login(); // login using upbond
        this.web3.setProvider(this.upbond.provider);

        const accounts = await this.web3.eth.getAccounts();

        this.isLoggedIn = true;
        return {
          msg: "success",
          data: _provider,
          accounts,
          // ... anything that you want to returns
        };
      }
    } catch (error: any) {
      console.log(error, "@errorOnReactProject?");
      toast.error(error.message || "Some error occured");
      return {
        msg: error.message || "Failed to login",
        data: null,
      };
    }
    console.log('UPBOND Embed Logged in!');
  }

  async logout() {
    console.log('UPBOND Embed Logging out...');
    try {
      if (this.upbond instanceof Upbond) {
        await this.upbond.logout();
        await this.upbond.cleanUp();
        window.location.reload();

        return {
          msg: "success",
          data: true,
        };
      }
    } catch (error: any) {
      toast.error(error.message || "Some error occured");
      return {
        msg: error.message || "Failed to login",
        data: null,
      };
    }
    console.log('UPBOND Embed Logged out!');
  }

  async getUserInfo() {
    if (this.upbond instanceof Upbond) {
      try {
        const userInfo = await this.upbond.getUserInfo();
        return userInfo;
      } catch (error: any) {
        toast.error(error.message || "Some error occured");
        throw new Error(error);
      }
    }
  }

  async signTransaction(msg = "", account: string) {
    console.log('UPBOND Embed Signing transaction...');
    if (this.web3 instanceof Web3) {
      try {
        this.web3.setProvider(this.upbond.provider);
        const sign = await this.web3.eth.sign(msg, account);
        console.log('UPBOND Embed Signed transaction!');
        return sign;
      } catch (error: any) {
        console.error(error);
        toast.error(error.message || "Some error occured");
        return null;
      }
    }
  }
  async signWeb3Token() {
    console.log('UPBOND Embed Signing web3 token...')
    try {
      const ether = new ethers.BrowserProvider(this.upbond.provider);
      const signer = await ether.getSigner();
      const sign = await Web3Token.sign(async (msg: string) => {
        if (this.web3 instanceof Web3) {
          return await signer.signMessage(msg);
        }
      }, "1d");
      console.log('UPBOND Embed Signed web3 token!');
      return sign;
    } catch (error: any) {
      toast.error(error.message || "Some error occured");
      return;
    }
  }
}

const upbondServices = new UpbondEmbed();

export default upbondServices;
