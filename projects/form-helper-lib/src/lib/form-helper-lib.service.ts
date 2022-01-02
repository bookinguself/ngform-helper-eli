/**
 *  * Copyright 2021 Eray-YL
 */
import { Injectable } from '@angular/core';
import { StrutFormControlHelper } from './strut-fromcontrol';
import { FormcontrolStrutHelp } from './strut-fromcontrol/FormcontrolStrutHelper';

@Injectable({
  providedIn: 'root'
})
export class FormHelperLibService {

  constructor() { }
  getInstanse(target:any):StrutFormControlHelper{
    return new FormcontrolStrutHelp(target);
  }
}
