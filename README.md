# FormHelperLib

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.
It simplifies generating FormGroup or FormArray,
Validation or format is declared via annotation in the object class.

# Online Example

[online Test ngform-helper-eli](https://stackblitz.com/edit/angular-ivy-yndwp6)

## How to install

###### `npm install ngform-helper-eli`

## Package dependencies<br>

###### `npm install class-transformer`

###### `npm install reflect-metadata`

###### `npm install uuid`

## How to declare the form control

Use annotation "@ADD_FORMCONTROL" over the object class file name<br>
Parameter inside the "@ADD_FORMCONTROL"<br>

| name       | value type      | desc                                                      |
|:----------:|:---------------:|:---------------------------------------------------------:|
| vFormatFns | string Array    | for init value formated, some value want to do the format |
| validation | validation rule | for declare the rule for form value                       |
|            | class strut     | Decide class type for object array or custom object       |

#### Example:

```
export class FormControlTest{

    @ADD_FORMCONTROL({"vFormatFns":["testformat"],"validation":{required:true,customvalidator:['testCustm']}})
    fromConString:string;

    @ADD_FORMCONTROL(() => FormControlTestChild)
    fromConCustomObjectArray:FormControlTestChild[];

    @ADD_FORMCONTROL(()=>FormcontrolTestChild2)
    fromConCustomObject:FormcontrolTestChild2;
}
```

#### Description of values/fields within @ADD_FORMCONTROL:

`"vFormatFns":["testformat"]` parses the field 'fromConString' thru method  "testformat". Function will be registered when user create the formgroup/formarray. Multiple format methods can be used.<br><br>

`"validation":{required:true,customvalidator:['testCustm']}`is the validatior declaration for the value below, custom validatiors can also be used as shown above "testCustm". The validators are registered when the formcontrols are generated. Multiple validators can be used as shown in the example above.<br><br>

| validation      | value type | desc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|:---------------:|:----------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| min             | number     | Validator that requires the control's value to be greater than or equal to the provided number                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| max             | number     | Validator that requires the control's value to be less than or equal to the provided number                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| required        | boolean    | Validator that requires the control have a non-empty value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| requiredtrue    | boolean    | Validator that requires the control's value be true. This validator is commonly used for required                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| email           | boolean    | Validator that requires the control's value pass an email validation test                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| minlength       | boolean    | Validator that requires the length of the control's value to be greater than or equal to the provided minimum length. This validator is also provided by default if you use the the HTML5 minlength attribute. Note that the minLength validator is intended to be used only for types that have a numeric length property, such as strings or arrays. The minLength validator logic is also not invoked for values when their length property is 0 (for example in case of an empty string or an empty array), to support optional controls. You can use the standard required validator if empty values should not be considered valid |
| maxlength       | boolean    | Validator that requires the length of the control's value to be less than or equal to the provided maximum length. This validator is also provided by default if you use the the HTML5 maxlength attribute. Note that the maxLength validator is intended to be used only for types that have a numeric length property, such as strings or arrays                                                                                                                                                                                                                                                                                       |
| pattern         | boolean    | Validator that requires the control's value to match a regex pattern. This validator is also provided by default if you use the HTML5 pattern attribute                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| nullvalidator   | boolean    | Validator that performs no operation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| customvalidator | string[]   | This is the custom validation method name array, there are declared and registor by user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## How to use in ts
* Online example [how to use](https://stackblitz.com/edit/angular-ivy-yndwp6)<br><br>
* declare the service in constructor method<br>
  ` constructor(private strutFormHelper:FormHelperLibService)`<br><br>

---

* generating the formhelper (declare one helper call 'formcontrolStrutHelp' in the class)<br>
  ` this.formcontrolStrutHelp = this.strutFormHelper.getInstanse(this);`<br>
  it can be more than one helper in one class when you need more than one formgroup object<br>
  
  ```
  this.formcontrolStrutHelp_1 = this.strutFormHelper.getInstanse(this);
  this.formcontrolStrutHelp_2 = this.strutFormHelper.getInstanse(this);
  this.formcontrolStrutHelp_3 = this.strutFormHelper.getInstanse(this);
  ```
  
  different helper will proccess different Formgroup object<br><br>

---

* Register custom method into helper, custom validation method and format method (if you have)<br>
  
  * custom validation<br>
    
    ```
    let customValidatorArray:CumstMethod[]=[];
    let customValidator:CumstMethod={} as CumstMethod;
    customValidator.bindObject=this; //this is optional, if no set object, default is current class
    customValidator.fn=this.validation1;
    customValidatorArray.push(customValidator);
    
    //if got one more validation in same field, just generate one more CumstMethod, for example:
    let customValidator2:CumstMethod={} as CumstMethod;
    customValidator2.bindObject=this; //this is optional, if no set object, default is current class
    customValidator2.fn=this.validation2;
    customValidatorArray.push(customValidator2);
    
    this.formcontrolStrutHelp.setCustomFN("testCustm", customValidatorArray);
    
    //method in the class
    //note: CtrlNname include object unique key and the field name, 
    //the unique key is uuid for object, it is auto generated.
    //the params "ctrlNname" and "someparams" is optional, Not necessary 
    validation1(ctrlNname?:CtrlNname,someparams?:any): ValidationErrors | null {
    ...TODO
    
    }
    
    validation2(ctrlNname?:CtrlNname,someparams?:any): ValidationErrors | null {
    ...TODO
    
    }
    ```
    
    ###### NOTE: Object unique key is uuid, it is important for every formgroup, the helper will search formgroup by this key<br><br>
  
  * Custom format method<br>
    
    ```
    let customFormatArray:CumstMethod[]=[];
    let customFormat:CumstMethod={} as CumstMethod;
    customFormat.bindObject=this; //this is optional, if no set object, default is current class
    customFormat.fn=this.customFormat;
    customFormatArray.push(customFormat);
    
    this.formcontrolStrutHelp.setCustomFN("testformat", customFormatArray);
    
    customFormat(fieldValue:any):any {
    ...TODO
    return afterFormatValue;
    }
    ```

---

* Init the object to formgroup or formarray<br>
  
  * Init the object (Example below creates one parent "FormControlTest", 2 child class "FormControlTestChild" and "FormcontrolTestChild2")<br><br>
    
    ```
     let con=new FormControlTest();
     con.testCon=[];
    
     let fchild1={} as  FormControlTestChild;
     fchild1.age=20;
     fchild1.name="test1";
     con.testCon.push(fchild1);        
    
     let fchild2={} as  FormControlTestChild;
     fchild2.age=22;
     fchild2.name="test2";
     con.testCon.push(fchild2);
     con.testFromCon='567';
    
     let yyy={} as FormcontrolTestChild2;
     yyy.rrr="testrrr";
     yyy.ttt=123445;
     con.testObj=yyy;
    
     let yyy2={} as  FormcontrolTestChild2;
     yyy2.rrr="test22222";
     yyy2.ttt=2222222;
    
     let yyy3={} as  FormcontrolTestChild2;
     yyy3.rrr="test333333";
     yyy3.ttt=33333;
     fchild1.testObj=yyy2;
     fchild2.testObj=yyy3;
    ```
  
  * Init FormGroup/FormArray<br>
    
    ```
    this.formcontrolStrutHelp.initForm(con);
    // or this.formcontrolStrutHelp.initForm(con, FormControlTest);
    this.myFormGroup = this.formcontrolStrutHelp.getFormGroup();
    ```
  
  * Declare the formgroup in html<br>
    
    ` <form   [formGroup]="myFormGroup">`<br><br>
  
  * Usage of form control in html
    
    `formControlName="testFromCon"`...

## Provider Method

##### initForm(object:any,classType?:any):any;

* Init the form object, object is the data object, class type is the class object (this is Optional when the data object don't have the class construtor<br>

---

##### refreshFormcontrol(object:any,classTyppe:any);

* refresh the formcontrol when the data object change the element iteam
  * some UI let user to add the element or remove element, after the object change, just refresh, it will add or remove the formcontrol into the new object

---

##### serializationObject(object:any,parenUUid?:string):any;

* Add uuid to object, currenly no need to call this function

---

##### setCustomFN(key:string,validatorCumst:CumstMethod[]);

* Set Custom method to helper

---

##### findFormGroupByCtrlKey(ctrlKey:string):FormGroup;

* Find formgroup by unique key, the ctrlKey should get from each formgroup, name "CONTROL-KEY", it can geting from service by  getControlKey() method

---

##### findAllParentByCtrlKey(ctrlKey:string):FormGroup[];

* Will looking for all the parent for ctrlKey giving by paramter, a groupform list will return, it will include all the parent and itself, the parent will sort by order inside the list
  * for example: [parent1, parent2....,itself]

---

##### findDuplicatedValueInFormArray(proName:string,formArray:any,notIncludeEmpty?:boolean):{[key:string]:FormControl};

* Find duplicate value inside the from array, proName is property name in data object class, formarray is data object formarray

---

##### findFormControlObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):FormControl;

##### findObjectsByPropertyNameAndCtrlKey(ctrlKey:string,proName:string,formControlObj:any):Object;

##### getFormGroup():any;

##### removeObjectByControlKey(obj:any,conKey:string,removeContrlName?:string,formArray?:FormArray):void;

##### removeAllFormControl():void;

##### getControlKey();

# Issues<br>
###### Any issues please raise to [ngform-helper-eli-issues](https://github.com/bookinguself/ngform-helper-eli/issues)

<br>--- 2021-11-07 Yilei Init---<br>
--- 2021-11-11 Jerry Tay Edit---

