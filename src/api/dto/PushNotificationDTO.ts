import { Type } from "class-transformer";
import { MaxLength, IsString, IsDefined } from "class-validator";

export default class PushNotificationDTO {
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MaxLength(100)
    userId!: string;

    @Type(() => String)
    @IsString()
    @MaxLength(50)
    title!: string;

    @Type(() => String)
    @IsString()
    @MaxLength(2000)
    bodyText!: string;

    @Type(() => String)
    @IsString()
    @MaxLength(500)
    url!: string;
}