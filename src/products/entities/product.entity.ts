import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '6f67718f-1ae1-46d5-bf34-a26d1726077a',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @ApiProperty(
        {
            example: 'T-Shirt Teslo',
            description: 'Product Title',
            uniqueItems: true
        }
    )
    @Column('text',{unique: true})
    title: string
    
    @ApiProperty(
        {
            example: 0,
            description: 'Product Price'
        }
    )
    @Column('numeric',{
        default: 0
    })
    price: number
    
    @ApiProperty(
        {
            example: 'Nikoga nema tko ljubi samu bol, tko je traži i želi je imati, jednostavno zato što je puka bol...',
            description: 'Product Desccription',
            default: null
        }
    )
    @Column({
        type: 'text',
        nullable: true
    })
    description: string
    
    @ApiProperty(
        {
            example: 't_shirt_teslo',
            description: 'Product SLUG - For SEO',
            uniqueItems: true
        }
    )
    @Column('text',{
        unique: true
    })
    slug: string
    
    @ApiProperty(
        {
            example: 10,
            description: 'Product Stock',
            default: 0
        }
    )
    @Column('int',{
        default: 0
    })
    stock: number
    
    @ApiProperty(
        {
            example: ['M','L','XL'],
            description: 'Product Sizes',
        }
    )
    @Column('text',{
        array: true
    })
    sizes: string[]
    
    @ApiProperty(
        {
            example: 'women',
            description: 'Product Gender',
        }
    )
    @Column('text')
    gender: string
    
    // tags
    
    @ApiProperty(
        {
            example: ['shirt'],
            description: 'Product Tags',
        }
    )
    @Column('text',{
        array: true, 
        default: []
    })
    tags: string[]
    
    @ApiProperty(
        {
            example: ['1740280-00-A_1.jpg'],
            description: 'Product Tags',
        }
    )
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {
        if(!this.slug){
            this.slug = this.title
        }
        this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'')
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug.toLowerCase().replaceAll(' ','_').replaceAll("'",'')
    }
}
