import { Expose, Type } from "class-transformer";
import { MaxLength, IsString, IsDefined, IsNotEmpty, IsOptional, IsBoolean, IsIn } from "class-validator";

export default class PushNotificationDTO {
    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    key!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    userId!: string;

    @Expose()
    @Type(() => String)
    @IsDefined()
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    title!: string;

    @Expose()
    @Type(() => Boolean)
    @IsOptional()
    @IsBoolean()
    silent = false;

    @Expose()
    @Type(() => Boolean)
    @IsOptional()
    @IsBoolean()
    requireInteraction = false;

    @Expose()
    @Type(() => String)
    @IsOptional()
    @IsString()
    @IsIn(['auto', 'ltr', 'rtl'])
    dir?: string;

    @Expose()
    @Type(() => String)
    @IsOptional()
    @IsString()
    @MaxLength(200)
    bodyText?: string;

    @Expose()
    @Type(() => String)
    @IsOptional()
    @IsString()
    @MaxLength(500)
    url?: string;

    @Expose()
    @Type(() => String)
    @IsOptional()
    @IsString()
    @MaxLength(500)
    imageUrl?: string;
}