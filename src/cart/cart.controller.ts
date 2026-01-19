import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import {
  CreateCartDto,
  UpdateCartDto,
  CartQueryDto,
  CartIdDto,
  AddToCartDto,
  RemoveFromCartDto,
  UpdateQuantityDto,
  ClearCartDto,
  SelectAllDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('购物车管理')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiOperation({ summary: '创建购物车' })
  create(@Body() body: CreateCartDto) {
    return this.cartService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取购物车列表' })
  findAll(@Query() query: CartQueryDto) {
    return this.cartService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取购物车详情' })
  findOne(@Param() params: CartIdDto) {
    return this.cartService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新购物车' })
  update(@Param() params: CartIdDto, @Body() body: UpdateCartDto) {
    return this.cartService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除购物车' })
  remove(@Param() params: CartIdDto) {
    return this.cartService.remove(params.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户购物车' })
  getUserCart(@Param('userId') userId: string) {
    return this.cartService.getUserCart(userId);
  }

  @Post('add')
  @ApiOperation({ summary: '添加商品到购物车' })
  addToCart(@Body() body: AddToCartDto) {
    return this.cartService.addToCart(body);
  }

  @Post('remove')
  @ApiOperation({ summary: '从购物车移除商品' })
  removeFromCart(@Body() body: RemoveFromCartDto) {
    return this.cartService.removeFromCart(body);
  }

  @Post('clear')
  @ApiOperation({ summary: '清空购物车' })
  clearCart(@Body() body: ClearCartDto) {
    return this.cartService.clearCart(body.userNo);
  }

  @Post('update-quantity')
  @ApiOperation({ summary: '更新购物车商品数量' })
  updateQuantity(@Body() body: UpdateQuantityDto) {
    return this.cartService.updateQuantity(body);
  }

  @Post('select-all')
  @ApiOperation({ summary: '全选/取消全选' })
  selectAll(@Body() body: SelectAllDto) {
    return this.cartService.selectAll(body);
  }
}
