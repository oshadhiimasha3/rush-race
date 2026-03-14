export function getMultiplier(streak:number){

if(streak>=10) return 5
if(streak>=5) return 3
if(streak>=3) return 2

return 1

}