'use client';

import useUpbond from "@/hooks/useUpbond";
import { ethers } from "ethers";
import { useEffect } from "react";
import { SiweMessage } from 'siwe';

export default function HooksRedirect() {
  const {
    upbondProvider,
    account,
    loading,
    signInfo,
    btnLoading,
    isCopy,
    txResult,
    bcState,
    userInfo,
    isShowUserInfo,
    showBc,
    signIn,
    signOut,
    getUser,
    getBlockchainInfo,
    signTransaction,
    signWeb3Token,
    deploy,
    setIsCopy,
  } = useUpbond();

  const getSIWEMessage = ({
    address,
    chainId,
    nonce,
  }: {
    address: string
    chainId: number
    nonce: string
  }): SiweMessage => {
    const params = {
      domain: window.location.host,
      address,
      statement: "statement",
      uri: window.location.origin,
      version: "1",
      chainId,
      nonce,
    };
    console.log("params", params);
    const message = new SiweMessage(params);

    return message;
  };

  useEffect(() => {
    console.log(`UpbondProvider: `, upbondProvider);
    if (!!upbondProvider) {
      const sign = async () => {
        const provider = new ethers.BrowserProvider(upbondProvider);
        const signer = await provider.getSigner();
        console.log('signer', signer.address);

        const message = getSIWEMessage({
          address: signer.address,
          chainId: 0x13881,
          nonce: "028741f21322ee4e1741044973650e6aeb9e5e14b81b70e2d4a5e6f4a90326307a", // !!for test, nonce is required!!
        });

        const signature = await signer.signMessage(message.prepareMessage());

        console.log(`signature: `, signature);
      }
      sign();
    }
  }, [upbondProvider])

  return <div>Done!</div>;
}