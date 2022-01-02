/**
 *
 *  * Copyright 2021 Eray-YL
 *
 * @author Yilei
 * @description: help to crate the json on the attribute in the obj， it is meta data format behide the data
*/
export interface FormControlAnnotationData{
    vFormatFns:string[];
    validation:Validation;
}
export interface CumstMethod{
    fn:Function;
    bindObject?:any;
    params?:{[key:string]:any};
 }

export interface CustomFn{
    fn:any;
    params?:any[];
    ctrlKey:any[];
}
export interface Validation{
    min?:number;
    max?:number;
    required?:boolean;
    requiredtrue?:boolean;
    email?:boolean;
    minlength?:number;
    maxlength?:number;
    pattern?:string;
    nullvalidator?:string;
    customvalidator?:string[];
}

export interface CtrlNname{
  ctrlKey:string;
  fieldName:string;
}
