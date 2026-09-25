import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { db, auth } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { IncomeItem, ExpenseItem, FutureIncomeItem } from '../types/finance';

export interface FamilyVaultData {
  id: string;
  householdName: string;
  incomes: IncomeItem[];
  expenses: ExpenseItem[];
  futureIncomes: FutureIncomeItem[];
  updatedAt: string;
  updatedBy: string;
}

export const DEFAULT_VAULT_ID = 'familia_santana';

/**
 * Real-time listener for the family finance document in Firestore.
 * Automatically synchronizes changes made by husband or wife across any device.
 */
export function subscribeFamilyVault(
  vaultId: string,
  onData: (data: FamilyVaultData) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const collectionPath = `family_finances`;
  const docRef = doc(db, collectionPath, vaultId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FamilyVaultData;
        onData(data);
      }
    },
    (error) => {
      console.error('Firestore onSnapshot error on family vault:', error);
      if (onError) onError(error as Error);
      try {
        handleFirestoreError(error, OperationType.GET, `${collectionPath}/${vaultId}`);
      } catch (e) {
        // error logged through handleFirestoreError
      }
    }
  );
}

/**
 * Saves or updates the shared family financial vault to Firestore.
 */
export async function saveFamilyVault(
  vaultId: string,
  vaultData: {
    householdName: string;
    incomes: IncomeItem[];
    expenses: ExpenseItem[];
    futureIncomes: FutureIncomeItem[];
    updatedBy?: string;
  }
): Promise<void> {
  const path = `family_finances/${vaultId}`;
  try {
    const docRef = doc(db, 'family_finances', vaultId);
    const payload: FamilyVaultData = {
      id: vaultId,
      householdName: vaultData.householdName || 'Orçamento Familiar Compartilhado',
      incomes: vaultData.incomes,
      expenses: vaultData.expenses,
      futureIncomes: vaultData.futureIncomes || [],
      updatedAt: new Date().toISOString(),
      updatedBy: vaultData.updatedBy || auth.currentUser?.displayName || auth.currentUser?.email || ' Alison & Esposa',
    };

    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fetches the shared family vault once.
 */
export async function fetchFamilyVault(vaultId: string): Promise<FamilyVaultData | null> {
  const path = `family_finances/${vaultId}`;
  try {
    const docRef = doc(db, 'family_finances', vaultId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FamilyVaultData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * Google Sign In for personalized access
 */
export async function signInGoogle(): Promise<User | null> {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
