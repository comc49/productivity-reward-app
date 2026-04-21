import { Injectable, inject } from '@angular/core';
import { computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  readonly user = toSignal(user(this.auth));
  readonly isLoggedIn = computed(() => !!this.user());

  signInWithGoogle(): Promise<void> {
    return signInWithPopup(this.auth, new GoogleAuthProvider()).then(() => undefined);
  }

  signOut(): Promise<void> {
    return signOut(this.auth);
  }

  getIdToken(): Promise<string | null> {
    const currentUser = this.user();
    return currentUser ? currentUser.getIdToken() : Promise.resolve(null);
  }
}
