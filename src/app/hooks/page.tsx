'use client';

import upbondServices from '@/lib/UpbondEmbed';
import { UserInfo } from '@upbond/upbond-embed';
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Web3, { TransactionReceipt } from 'web3';
import SpinnerLoading from "@/components/SpinnerLoading";
import useUpbond from '@/hooks/useUpbond';

export default function Hooks() {
  const {
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
    setIsCopy
  } = useUpbond();

  return (
    <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
      <header className="App-header">
        <p className="text-center text-xl font-bold my-3 lg:text-2xl">
          Demo of UPBOND in DApps
        </p>
        <div className="mt-4 w-full px-4 flex justify-center">
          <p className="text-center">
            See how UPBOND can be embedded in your dapp.
          </p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="http://localhost:3000/upbondbanner.png"
          className="w-1/2 mx-auto rounded-xl m-5"
          alt="UpbondBanner"
        />
        {account && account.length > 0 ? (
          <div>
            <p className="text-center">Account : {account}</p>

            <div className="flex justify-center mt-3 gap-3">
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={getUser}
              >
                Toggle User Info
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={() => getBlockchainInfo(false)}
              >
                Toggle blockchain info
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                onClick={signOut}
              >
                Logout
              </button>
            </div>
            {/* User Info */}
            {userInfo && isShowUserInfo && (
              <div className="text-center my-3">
                <p className="font-bold">User Info</p>
                <p>Name: {userInfo.name}</p>
                <p>Email: {userInfo.email}</p>
                <p>Login with: {userInfo.typeOfLogin}</p>
                <p>Verifier: {userInfo.verifier}</p>
              </div>
            )}
            {/* bc info */}
            {showBc && bcState.chainId !== 0 && (
              <div className="text-center my-3">
                <p className="font-bold">Blockchain Info</p>
                {Object.keys(bcState).map((x) => (
                  <p className="text-black" key={x}>
                    {x}: {bcState[x as keyof typeof bcState]}
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-1 justify-center space-x-5 mt-2">
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                onClick={signTransaction}
              >
                Sign Transaction
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={signWeb3Token}
              >
                Sign Web3Token
              </button>
              <button
                type="button"
                disabled={btnLoading}
                className="disabled:bg-gray-500 items-center px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={deploy}
              >
                Send Transaction
              </button>
            </div>
            <p className="text-black mt-5">Output: </p>
            <div className="overflow-hidden rounded-lg bg-white shadow mt-2">
              <div className="px-4 py-5 sm:p-6 whitespace-pre-line break-words">
                {signInfo ? signInfo : "Nothing"}
              </div>
            </div>
            {signInfo && (
              <button
                type="button"
                className="inline-flex mt-5 items-center px-3 py-1.5 text-xs font-medium rounded-full shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]"
                onClick={async () => {
                  await navigator.clipboard.writeText(signInfo);
                  setIsCopy(true);
                }}
              >
                {isCopy ? "Copied" : "Copy"}
              </button>
            )}
            {txResult && Object.keys(txResult).length > 0 && (
              <p className="text-black mt-5">Transaction Output: </p>
            )}
            {txResult && Object.keys(txResult!).map((x) => (
              <div
                className="overflow-hidden rounded-lg bg-white shadow mt-2"
                key={x}
              >
                <div className="px-4 py-5 sm:p-6 whitespace-pre-line break-words">
                  {/* @ts-ignore */}
                  {x}: {txResult[x as keyof typeof txResult]}
                </div>
              </div>
            )
            )}
          </div>
        ) : (
          <div className="flex justify-center">
            {loading === true ? (
              <SpinnerLoading />
            ) : (
              <div className="flex flex-1 flex-col space-y-3">
                <button
                  type="button"
                  className="mx-auto px-4 py-2 text-sm font-medium rounded-xl shadow-sm text-white bg-[#4B68AE] hover:bg-[#214999] border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4B68AE]  w-1/4"
                  onClick={signIn}
                >
                  Login 3.0
                </button>
              </div>
            )}
          </div>
        )}
      </header>
      <Toaster
        toastOptions={{
          className: "toaster",
        }}
        position="top-center"
        reverseOrder={false}
      />
    </div>
  );
}
