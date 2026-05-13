import { apiFetch } from "@/lib/api";
import type { Account, AccountPatch } from "./account.types";

type AccountResponse = {
  account: Account;
};

export async function fetchAccount(token: string | null) {
  const res = await apiFetch(token, "/v1/account");
  const data = (await res.json()) as AccountResponse;
  return data.account;
}

export async function patchAccount(token: string | null, patch: AccountPatch) {
  const res = await apiFetch(token, "/v1/account", {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as AccountResponse;
  return data.account;
}
