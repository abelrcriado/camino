/**
 * @swagger
 * /api/productos:
 *   get:
 *     summary: Obtener listado de productos
 *     description: Retorna lista de productos con filtros, paginación y ordenamiento
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *         description: Filtrar por SKU exacto
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Filtrar por nombre (búsqueda parcial)
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar por ID de categoría
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Filtrar por marca
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: perecedero
 *         schema:
 *           type: boolean
 *         description: Filtrar por productos perecederos
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda general por nombre, SKU o marca
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Cantidad de resultados por página
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [nombre, sku, precio_venta, created_at, updated_at]
 *           default: created_at
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden ascendente o descendente
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parámetros de consulta inválidos
 *       500:
 *         description: Error interno del servidor
 *
 *   post:
 *     summary: Crear nuevo producto
 *     description: Crea un producto con validación de SKU único
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sku
 *               - nombre
 *               - category_id
 *               - costo_base
 *               - precio_venta
 *             properties:
 *               sku:
 *                 type: string
 *                 example: "COCA-COLA-500ML"
 *               nombre:
 *                 type: string
 *                 example: "Coca-Cola 500ml"
 *               descripcion:
 *                 type: string
 *                 example: "Bebida gaseosa sabor cola"
 *               category_id:
 *                 type: string
 *                 format: uuid
 *               subcategory_id:
 *                 type: string
 *                 format: uuid
 *               marca:
 *                 type: string
 *                 example: "Coca-Cola"
 *               modelo:
 *                 type: string
 *               costo_base:
 *                 type: integer
 *                 description: "Costo en centavos"
 *                 example: 80
 *               precio_venta:
 *                 type: integer
 *                 description: "Precio en centavos"
 *                 example: 150
 *               tasa_iva:
 *                 type: number
 *                 default: 21.0
 *               unidad_medida:
 *                 type: string
 *                 enum: [unidad, paquete, caja, litro, kilogramo, gramo]
 *                 default: "unidad"
 *               peso_gramos:
 *                 type: integer
 *                 example: 500
 *               dimensiones:
 *                 type: object
 *                 properties:
 *                   largo:
 *                     type: number
 *                   ancho:
 *                     type: number
 *                   alto:
 *                     type: number
 *                   unidad:
 *                     type: string
 *                     enum: [cm, m, mm]
 *               codigo_barras:
 *                 type: string
 *               requiere_refrigeracion:
 *                 type: boolean
 *                 default: false
 *               perecedero:
 *                 type: boolean
 *                 default: false
 *               meses_caducidad:
 *                 type: integer
 *               dias_caducidad:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos de entrada inválidos
 *       409:
 *         description: SKU ya existe
 *       500:
 *         description: Error interno del servidor
 *
 *   put:
 *     summary: Actualizar producto existente
 *     description: Actualiza un producto por ID
 *     tags: [Productos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio_venta:
 *                 type: integer
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Producto no encontrado
 *       409:
 *         description: SKU ya existe
 *       500:
 *         description: Error interno del servidor
 *
 *   delete:
 *     summary: Eliminar producto (soft delete)
 *     description: Marca el producto como inactivo
 *     tags: [Productos]
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del producto a eliminar
 *     responses:
 *       200:
 *         description: Producto marcado como inactivo exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: ID inválido
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno del servidor
 *
 * components:
 *   schemas:
 *     Producto:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         sku:
 *           type: string
 *         nombre:
 *           type: string
 *         descripcion:
 *           type: string
 *         category_id:
 *           type: string
 *           format: uuid
 *         marca:
 *           type: string
 *         modelo:
 *           type: string
 *         costo_base:
 *           type: integer
 *         precio_venta:
 *           type: integer
 *         unidad_medida:
 *           type: string
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

import { NextApiRequest, NextApiResponse } from "next";
import { ProductoController } from "@/api/controllers/producto.controller";
import { asyncHandler } from "@/api/middlewares/error-handler";

const controller = new ProductoController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  return controller.handle(req, res);
});
