export class ResponseModel {
 
    public success: boolean;
    public message: string;
    public result: any;

    constructor()
    {
        this.success = false;
        this.message = "";
    }

}