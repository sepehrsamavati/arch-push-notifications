import { Expose, Type } from "class-transformer";
import { MaxLength, IsString, IsDefined } from "class-validator";

export default class PushNotificationDTO {
    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MaxLength(100)
    key!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsString()
    @MaxLength(100)
    userId!: string;

    @Expose()
    @Type(() => String)
    @IsString()
    @MaxLength(50)
    title!: string;

    @Expose()
    @Type(() => String)
    @IsString()
    @MaxLength(2000)
    bodyText!: string;

    @Expose()
    @Type(() => String)
    @IsString()
    @MaxLength(500)
    url!: string;
}