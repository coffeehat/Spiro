import { defineStore } from "pinia";

export enum ReplyMutexScope {
  Scope_Undef = 0,
  Scope_All = 1,
  Scope_First_Reply = 2,
  Scope_Second_Replay = 3
}

export const useReplyMutexStore = defineStore(
  'reply_mutex',
  {
    state: () => {
      return {
        scope: ReplyMutexScope.Scope_Undef,
        // TODO: Maybe we can collect all the element of each scope and shut them down?
        acquire_counter: 0 // TODO: this is ugly
      }
    },
    actions: {
      acquire(scope: ReplyMutexScope) {
        this.scope = scope;
        this.acquire_counter++;
      }
    }
  }
)