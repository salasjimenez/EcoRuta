import { CargoType } from '../../vehicles/cargo-type.enum';

export type MatchCriteria = {
  originCity: boolean;
  destinationCity: boolean;
  pickupWindow: boolean;
  deliveryWindow: boolean;
  weightCapacity: boolean;
  volumeCapacity: boolean;
  cargoType: boolean;
};

export type MatchCapacity = {
  requestedWeightKg: number;
  remainingWeightKg: number;
  requestedVolumeM3: number;
  remainingVolumeM3: number;
  weightUtilizationPct: number;
  volumeUtilizationPct: number;
};

export type BasicMatchResult = {
  score: number;
  criteriaVersion: 'basic-v1';
  criteria: MatchCriteria;
  capacity: MatchCapacity;
  cargoType: CargoType;
};
