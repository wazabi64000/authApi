import joi from 'joi'
 
export const createUserSchema = joi.object({
    name : joi.string().min(3).max(50).required().empty().trim().alphanum().message({"string.empty": `Le nom est vide `}),
    lastname : joi.string().min(3).max(50).required().alphanum().empty().trim().message({"string.empty": `Le prénom est vide `}),
    email : joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr', 'io' ] } }).required().empty().trim().message({"string.empty": `L'email est vide `}),
    password : joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).min(3).max(50).required().empty().trim().message({"string.empty": `Le mot de passe est vide `}),
    confirmPassword : joi.ref('password'),
    role : joi.string(),
    avatar  : joi.string()

})


export const loginShema = joi.object({
  
    email : joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr', 'io' ] } }).required().empty().trim().message({"string.empty": `L'email est vide `}),
    password : joi.string().min(3).max(50).required().empty().trim().message({"string.empty": `Le mot de passe est vide `}),
  

})


 